import { Router } from 'express'
import { z } from 'zod'
import Product from '../models/Product.js'
import Artisan from '../models/Artisan.js'
import { requireAuth, optionalAuth } from '../middleware/auth.js'
import { authenticateToken } from '../middleware/firebase-auth.js'
import { validate, paginationSchema, searchSchema } from '../middleware/validation.js'

const router = Router()

const upsertSchema = z.object({
	name: z.string().min(1).max(200),
	description: z.string().max(4000).optional().default(''),
	price: z.number().nonnegative(),
	originalPrice: z.number().nonnegative().optional(),
	images: z.array(z.string()).optional().default([]),
	artisanId: z.string().regex(/^[0-9a-fA-F]{24}$/),
	category: z.enum(['pottery', 'textiles', 'jewelry', 'woodwork', 'metalwork', 'paintings', 'crafts', 'toys']),
	subcategory: z.string().optional(),
	materials: z.array(z.string()).optional().default([]),
	colors: z.array(z.string()).optional().default([]),
	tags: z.array(z.string()).optional().default([]),
	stockCount: z.number().int().nonnegative().optional().default(0),
	inStock: z.boolean().optional().default(true),
	dimensions: z.string().optional(),
	weight: z.string().optional(),
	shippingTime: z.string().optional(),
	featured: z.boolean().optional().default(false),
	isHandmade: z.boolean().optional().default(true)
})

// Enhanced products listing with search, filter, and pagination
router.get('/', 
	validate(z.object({
		...paginationSchema.shape,
		...searchSchema.shape,
		featured: z.coerce.boolean().optional(),
		sortBy: z.enum(['name', 'price', 'rating', 'createdAt', 'salesCount']).optional().default('createdAt')
	}), 'query'),
	async (req, res) => {
		try {
			const {
				page = 1,
				limit = 20,
				q,
				category,
				minPrice,
				maxPrice,
				artisanId,
				inStock,
				featured,
				sortBy = 'createdAt',
				order = 'desc'
			} = req.validatedQuery

			// Build filter
			const filter = { isActive: true }

			if (q) {
				filter.$text = { $search: q }
			}

			if (category) {
				filter.category = category
			}

			if (minPrice !== undefined || maxPrice !== undefined) {
				filter.price = {}
				if (minPrice !== undefined) filter.price.$gte = minPrice
				if (maxPrice !== undefined) filter.price.$lte = maxPrice
			}

			if (artisanId) {
				filter.artisanId = artisanId
			}

			if (inStock) {
				filter.stockCount = { $gt: 0 }
			}

			if (featured !== undefined) {
				filter.featured = featured
			}

			// Build sort
			const sort = {}
			if (q && !sortBy) {
				sort.score = { $meta: 'textScore' }
			} else {
				sort[sortBy] = order === 'desc' ? -1 : 1
			}

			// Execute query with pagination
			const skip = (page - 1) * limit
			const [products, total] = await Promise.all([
				Product.find(filter)
					.sort(sort)
					.skip(skip)
					.limit(limit)
					.populate('artisanId', 'name location.city location.state bio avatar rating totalProducts')
					.lean(),
				Product.countDocuments(filter)
			])

			// Transform products to match frontend interface
			const transformedProducts = products.map(product => ({
				id: product._id.toString(),
				name: product.name,
				description: product.description,
				price: product.price,
				originalPrice: product.originalPrice,
				images: Array.isArray(product.images) ? product.images : [],
				category: product.category,
				subcategory: product.subcategory,
				materials: Array.isArray(product.materials) ? product.materials : [],
				dimensions: product.dimensions,
				weight: product.weight,
				colors: Array.isArray(product.colors) ? product.colors : [],
				inStock: product.inStock,
				stockCount: product.stockCount,
				artisan: product.artisanId ? {
					id: product.artisanId._id.toString(), 
					name: product.artisanId.name,
					location: `${product.artisanId.location.city}, ${product.artisanId.location.state}`,
					bio: product.artisanId.bio,
					avatar: product.artisanId.avatar,
					rating: product.artisanId.rating,
					totalProducts: product.artisanId.totalProducts
				} : null,
				rating: product.rating,
				reviewCount: product.reviewCount,
				tags: Array.isArray(product.tags) ? product.tags : [],
				isHandmade: product.isHandmade,
				shippingTime: product.shippingTime,
				featured: product.featured
			}))

			const totalPages = Math.ceil(total / limit)

			return res.json({
				products: transformedProducts,
				pagination: {
					page,
					limit,
					total,
					totalPages,
					hasNext: page < totalPages,
					hasPrev: page > 1
				}
			})
		} catch (error) {
			console.error('Products list error:', error)
			return res.status(500).json({ error: 'Server error' })
		}
	}
)

// Get single product with artisan details
router.get('/:id', optionalAuth, async (req, res) => {
	try {
		const product = await Product.findById(req.params.id)
			.populate('artisanId', 'name bio location.city location.state rating totalProducts avatar')
			.lean()

		if (!product || !product.isActive) {
			return res.status(404).json({ error: 'Product not found' })
		}

		// Transform product to match frontend interface
		const transformedProduct = {
			id: product._id.toString(),
			name: product.name,
			description: product.description,
			price: product.price,
			originalPrice: product.originalPrice,
			images: Array.isArray(product.images) ? product.images : [],
			category: product.category,
			subcategory: product.subcategory,
			materials: Array.isArray(product.materials) ? product.materials : [],
			dimensions: product.dimensions,
			weight: product.weight,
			colors: Array.isArray(product.colors) ? product.colors : [],
			inStock: product.inStock,
			stockCount: product.stockCount,
			artisan: product.artisanId ? {
				id: product.artisanId._id.toString(),
				name: product.artisanId.name,
				location: `${product.artisanId.location.city}, ${product.artisanId.location.state}`,
				bio: product.artisanId.bio,
				avatar: product.artisanId.avatar,
				rating: product.artisanId.rating,
				totalProducts: product.artisanId.totalProducts
			} : null,
			rating: product.rating,
			reviewCount: product.reviewCount,
			tags: Array.isArray(product.tags) ? product.tags : [],
			isHandmade: product.isHandmade,
			shippingTime: product.shippingTime,
			featured: product.featured
		}

		// Increment view count (fire and forget)
		Product.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }).exec()

		return res.json(transformedProduct)
	} catch (error) {
		console.error('Get product error:', error)
		return res.status(500).json({ error: 'Server error' })
	}
})

router.post('/', requireAuth, async (req, res) => {
	const parsed = upsertSchema.safeParse(req.body)
	if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0]?.message })
	const existsArtisan = await Artisan.findById(parsed.data.artisanId)
	if (!existsArtisan) return res.status(400).json({ error: 'Invalid artisanId' })
	const created = await Product.create(parsed.data)
	return res.status(201).json(created)
})

router.put('/:id', requireAuth, async (req, res) => {
	const parsed = upsertSchema.partial().safeParse(req.body)
	if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0]?.message })
	const updated = await Product.findByIdAndUpdate(req.params.id, parsed.data, { new: true })
	if (!updated) return res.status(404).json({ error: 'Not found' })
	return res.json(updated)
})

router.delete('/:id', requireAuth, async (req, res) => {
	const deleted = await Product.findByIdAndDelete(req.params.id)
	if (!deleted) return res.status(404).json({ error: 'Not found' })
	return res.status(204).end()
})

// Artisan routes
// Get artisan's products
router.get('/artisan/my-products',
	authenticateToken,
	validate(paginationSchema, 'query'),
	async (req, res) => {
		try {
			const { page, limit, sort, order } = req.validatedQuery
			const skip = (page - 1) * limit
			
			const sortObj = {}
			if (sort) {
				sortObj[sort] = order === 'asc' ? 1 : -1
			} else {
				sortObj.createdAt = -1
			}
			
			const products = await Product.find({ artisanId: req.user._id })
				.sort(sortObj)
				.skip(skip)
				.limit(limit)
				.populate('artisanId', 'name')
				.select('-__v')
				.lean()
			
			const total = await Product.countDocuments({ artisanId: req.user._id })
			
			res.json({
				products,
				pagination: {
					page,
					limit,
					total,
					pages: Math.ceil(total / limit)
				}
			})
		} catch (error) {
			console.error('Error fetching artisan products:', error)
			res.status(500).json({ error: 'Failed to fetch products' })
		}
	}
)

export default router




