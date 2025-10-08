import { Router } from 'express'
import { z } from 'zod'
import Review from '../models/Review.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import { requireAuth, requireActiveUser, requireAdmin } from '../middleware/auth.js'
import { validate, idSchema, paginationSchema } from '../middleware/validation.js'

const router = Router()

const createReviewSchema = z.object({
	productId: idSchema,
	orderId: idSchema,
	rating: z.number().int().min(1).max(5),
	title: z.string().min(1).max(100).optional(),
	comment: z.string().min(1).max(1000),
	images: z.array(z.string().url()).max(5).optional()
})

const respondToReviewSchema = z.object({
	message: z.string().min(1).max(500)
})

// Get reviews for a product
router.get('/product/:productId',
	validate(z.object({ productId: idSchema }), 'params'),
	validate(paginationSchema, 'query'),
	async (req, res) => {
		try {
			const { productId } = req.validatedParams
			const { page, limit, sort, order } = req.validatedQuery
			const skip = (page - 1) * limit
			
			const sortObj = {}
			if (sort) {
				sortObj[sort] = order === 'asc' ? 1 : -1
			} else {
				sortObj.createdAt = -1
			}
			
			const reviews = await Review.find({ 
				productId, 
				isApproved: true 
			})
				.sort(sortObj)
				.skip(skip)
				.limit(limit)
				.populate('userId', 'name avatar')
				.populate('response.respondedBy', 'name')
				.select('-__v')
				.lean()
			
			const total = await Review.countDocuments({ 
				productId, 
				isApproved: true 
			})
			
			// Calculate rating statistics
			const ratingStats = await Review.aggregate([
				{ $match: { productId: productId, isApproved: true } },
				{
					$group: {
						_id: '$rating',
						count: { $sum: 1 }
					}
				},
				{ $sort: { _id: -1 } }
			])
			
			const avgRating = await Review.aggregate([
				{ $match: { productId: productId, isApproved: true } },
				{
					$group: {
						_id: null,
						avgRating: { $avg: '$rating' },
						totalReviews: { $sum: 1 }
					}
				}
			])
			
			res.json({
				reviews,
				pagination: {
					page,
					limit,
					total,
					pages: Math.ceil(total / limit)
				},
				statistics: {
					averageRating: avgRating[0]?.avgRating || 0,
					totalReviews: avgRating[0]?.totalReviews || 0,
					ratingDistribution: ratingStats
				}
			})
		} catch (error) {
			console.error('Error fetching reviews:', error)
			res.status(500).json({ error: 'Failed to fetch reviews' })
		}
	}
)

// Get user's reviews
router.get('/my-reviews',
	requireAuth,
	requireActiveUser,
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
			
			const reviews = await Review.find({ userId: req.user.sub })
				.sort(sortObj)
				.skip(skip)
				.limit(limit)
				.populate('productId', 'name images')
				.populate('orderId', 'orderNumber')
				.populate('response.respondedBy', 'name')
				.select('-__v')
				.lean()
			
			const total = await Review.countDocuments({ userId: req.user.sub })
			
			res.json({
				reviews,
				pagination: {
					page,
					limit,
					total,
					pages: Math.ceil(total / limit)
				}
			})
		} catch (error) {
			console.error('Error fetching user reviews:', error)
			res.status(500).json({ error: 'Failed to fetch reviews' })
		}
	}
)

// Create a review
router.post('/',
	requireAuth,
	requireActiveUser,
	validate(createReviewSchema),
	async (req, res) => {
		try {
			const { productId, orderId, rating, title, comment, images } = req.validatedBody
			const userId = req.user.sub
			
			// Verify that user has ordered this product
			const order = await Order.findOne({
				_id: orderId,
				userId: userId,
				'items.productId': productId,
				status: 'delivered' // Can only review delivered orders
			})
			
			if (!order) {
				return res.status(400).json({ 
					error: 'You can only review products from your delivered orders' 
				})
			}
			
			// Check if review already exists for this product/order combination
			const existingReview = await Review.findOne({
				userId,
				productId,
				orderId
			})
			
			if (existingReview) {
				return res.status(400).json({ 
					error: 'You have already reviewed this product' 
				})
			}
			
			// Create review
			const review = new Review({
				userId,
				productId,
				orderId,
				rating,
				title,
				comment,
				images: images || [],
				isVerified: true // Verified purchase
			})
			
			await review.save()
			
			// Update product rating
			await updateProductRating(productId)
			
			// Populate and return the review
			const populatedReview = await Review.findById(review._id)
				.populate('userId', 'name avatar')
				.populate('productId', 'name')
				.lean()
			
			res.status(201).json({
				message: 'Review created successfully',
				review: populatedReview
			})
		} catch (error) {
			console.error('Error creating review:', error)
			res.status(500).json({ error: 'Failed to create review' })
		}
	}
)

// Update a review
router.patch('/:id',
	requireAuth,
	requireActiveUser,
	validate(z.object({ id: idSchema }), 'params'),
	validate(createReviewSchema.partial()),
	async (req, res) => {
		try {
			const reviewId = req.validatedParams.id
			const updateData = req.validatedBody
			
			const review = await Review.findOne({
				_id: reviewId,
				userId: req.user.sub
			})
			
			if (!review) {
				return res.status(404).json({ error: 'Review not found' })
			}
			
			// Update fields
			Object.assign(review, updateData)
			await review.save()
			
			// Update product rating if rating changed
			if (updateData.rating) {
				await updateProductRating(review.productId)
			}
			
			// Return updated review
			const updatedReview = await Review.findById(reviewId)
				.populate('userId', 'name avatar')
				.populate('productId', 'name')
				.lean()
			
			res.json({
				message: 'Review updated successfully',
				review: updatedReview
			})
		} catch (error) {
			console.error('Error updating review:', error)
			res.status(500).json({ error: 'Failed to update review' })
		}
	}
)

// Delete a review
router.delete('/:id',
	requireAuth,
	requireActiveUser,
	validate(z.object({ id: idSchema }), 'params'),
	async (req, res) => {
		try {
			const review = await Review.findOneAndDelete({
				_id: req.validatedParams.id,
				userId: req.user.sub
			})
			
			if (!review) {
				return res.status(404).json({ error: 'Review not found' })
			}
			
			// Update product rating
			await updateProductRating(review.productId)
			
			res.json({ message: 'Review deleted successfully' })
		} catch (error) {
			console.error('Error deleting review:', error)
			res.status(500).json({ error: 'Failed to delete review' })
		}
	}
)

// Respond to a review (for artisans/admins)
router.post('/:id/respond',
	requireAuth,
	requireActiveUser,
	validate(z.object({ id: idSchema }), 'params'),
	validate(respondToReviewSchema),
	async (req, res) => {
		try {
			const { message } = req.validatedBody
			const reviewId = req.validatedParams.id
			
			const review = await Review.findById(reviewId)
				.populate('productId', 'artisanId')
			
			if (!review) {
				return res.status(404).json({ error: 'Review not found' })
			}
			
			// Check if user is the artisan who created the product or an admin
			const isArtisan = review.productId.artisanId.toString() === req.user.sub
			const isAdmin = req.userDoc.role === 'admin'
			
			if (!isArtisan && !isAdmin) {
				return res.status(403).json({ 
					error: 'Only the product artisan or admin can respond to reviews' 
				})
			}
			
			// Add response
			review.response = {
				message,
				respondedBy: req.user.sub,
				respondedAt: new Date()
			}
			
			await review.save()
			
			// Return updated review
			const updatedReview = await Review.findById(reviewId)
				.populate('userId', 'name avatar')
				.populate('response.respondedBy', 'name')
				.lean()
			
			res.json({
				message: 'Response added successfully',
				review: updatedReview
			})
		} catch (error) {
			console.error('Error responding to review:', error)
			res.status(500).json({ error: 'Failed to respond to review' })
		}
	}
)

// Admin: Get all reviews for moderation
router.get('/admin/all',
	requireAuth,
	requireActiveUser,
	requireAdmin,
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
			
			const reviews = await Review.find()
				.sort(sortObj)
				.skip(skip)
				.limit(limit)
				.populate('userId', 'name email')
				.populate('productId', 'name')
				.populate('response.respondedBy', 'name')
				.select('-__v')
				.lean()
			
			const total = await Review.countDocuments()
			
			res.json({
				reviews,
				pagination: {
					page,
					limit,
					total,
					pages: Math.ceil(total / limit)
				}
			})
		} catch (error) {
			console.error('Error fetching all reviews:', error)
			res.status(500).json({ error: 'Failed to fetch reviews' })
		}
	}
)

// Helper function to update product rating
async function updateProductRating(productId) {
	const stats = await Review.aggregate([
		{ $match: { productId: productId, isApproved: true } },
		{
			$group: {
				_id: null,
				avgRating: { $avg: '$rating' },
				reviewCount: { $sum: 1 }
			}
		}
	])
	
	const { avgRating = 0, reviewCount = 0 } = stats[0] || {}
	
	await Product.findByIdAndUpdate(productId, {
		rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
		reviewCount
	})
}

// Get reviews for artisan's products
router.get('/artisan/my-reviews',
	requireAuth,
	requireActiveUser,
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
			
			// Find all products by this artisan
			const artisanProducts = await Product.find({ artisanId: req.user.sub }).select('_id')
			const productIds = artisanProducts.map(p => p._id)
			
			const reviews = await Review.find({ 
				productId: { $in: productIds },
				isApproved: true 
			})
				.sort(sortObj)
				.skip(skip)
				.limit(limit)
				.populate('userId', 'name avatar')
				.populate('productId', 'name images')
				.populate('orderId', 'orderNumber')
				.populate('response.respondedBy', 'name')
				.select('-__v')
				.lean()
			
			const total = await Review.countDocuments({ 
				productId: { $in: productIds },
				isApproved: true 
			})
			
			res.json({
				reviews,
				pagination: {
					page,
					limit,
					total,
					pages: Math.ceil(total / limit)
				}
			})
		} catch (error) {
			console.error('Error fetching artisan reviews:', error)
			res.status(500).json({ error: 'Failed to fetch reviews' })
		}
	}
)

export default router