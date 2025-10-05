import { Router } from 'express'
import { z } from 'zod'
import Artisan from '../models/Artisan.js'
import { authenticateToken } from '../middleware/firebase-auth.js'

const router = Router()

const upsertSchema = z.object({
	name: z.string().min(1).max(200),
	bio: z.string().max(4000).optional().default(''),
	location: z.string().max(200).optional().default(''),
	socials: z.record(z.string(), z.string().url()).optional().default({}),
})

// Artisan profile schema for updates
const artisanProfileUpdateSchema = z.object({
	name: z.string().min(1).max(200).optional(),
	bio: z.string().max(1000).optional(),
	location: z.object({
		city: z.string().min(1).max(100),
		state: z.string().min(1).max(100),
		country: z.string().default('India')
	}).optional(),
	specialties: z.array(z.string()).optional(),
	experience: z.number().min(0).optional(),
	socials: z.object({
		instagram: z.string().optional(),
		facebook: z.string().optional(),
		website: z.string().url().optional()
	}).optional(),
	verification: z.object({
		documentType: z.enum(['aadhar', 'pan', 'license']).optional(),
		documentNumber: z.string().optional(),
		bankDetails: z.object({
			accountNumber: z.string().optional(),
			ifscCode: z.string().optional(),
			bankName: z.string().optional()
		}).optional()
	}).optional()
}).partial()

router.get('/', async (_req, res) => {
	const items = await Artisan.find().limit(200).lean()
	return res.json(items)
})

router.get('/:id', async (req, res) => {
	const item = await Artisan.findById(req.params.id).lean()
	if (!item) return res.status(404).json({ error: 'Not found' })
	return res.json(item)
})

router.post('/', authenticateToken, async (req, res) => {
	const parsed = upsertSchema.safeParse(req.body)
	if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0]?.message })
	const created = await Artisan.create(parsed.data)
	return res.status(201).json(created)
})

router.put('/:id', authenticateToken, async (req, res) => {
	const parsed = upsertSchema.partial().safeParse(req.body)
	if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0]?.message })
	const updated = await Artisan.findByIdAndUpdate(req.params.id, parsed.data, { new: true })
	if (!updated) return res.status(404).json({ error: 'Not found' })
	return res.json(updated)
})

router.delete('/:id', authenticateToken, async (req, res) => {
	const deleted = await Artisan.findByIdAndDelete(req.params.id)
	if (!deleted) return res.status(404).json({ error: 'Not found' })
	return res.status(204).end()
})

// Artisan profile routes
// Get current user's artisan profile
router.get('/profile', authenticateToken, async (req, res) => {
	try {
		const artisan = await Artisan.findOne({ userId: req.user._id }).lean()
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		// Transform to match frontend interface
		const profile = {
			_id: artisan._id.toString(),
			name: artisan.name,
			email: req.user.email, // From user object
			phone: req.user.phone || '',
			avatar: artisan.avatar || '',
			bio: artisan.bio || '',
			location: artisan.location,
			specialization: artisan.specialties || [],
			experience: artisan.experience || 0,
			languages: [], // Not in model yet
			socialLinks: artisan.socials || {},
			businessInfo: {
				businessName: '', // Not in model yet
				gstNumber: '', // Not in model yet
				panNumber: '', // Not in model yet
				bankDetails: artisan.verification?.bankDetails || {}
			},
			certifications: [], // Not in model yet
			skills: [], // Not in model yet
			workExperience: [], // Not in model yet
			education: [], // Not in model yet
			stats: {
				totalProducts: artisan.totalProducts || 0,
				totalOrders: 0, // Would need to calculate from orders
				totalRevenue: artisan.totalSales || 0,
				averageRating: artisan.rating || 0,
				totalReviews: artisan.totalRatings || 0
			},
			createdAt: artisan.createdAt?.toISOString() || artisan.joinedDate?.toISOString(),
			updatedAt: artisan.updatedAt?.toISOString() || artisan.joinedDate?.toISOString()
		}

		res.json(profile)
	} catch (error) {
		console.error('Error fetching artisan profile:', error)
		res.status(500).json({ error: 'Failed to fetch artisan profile' })
	}
})

// Update current user's artisan profile
router.put('/profile', authenticateToken, async (req, res) => {
	try {
		const parsed = artisanProfileUpdateSchema.safeParse(req.body)
		if (!parsed.success) {
			return res.status(400).json({ error: parsed.error.errors[0]?.message })
		}

		const updateData = parsed.data

		// Transform frontend fields to match database schema
		const dbUpdate = {
			...(updateData.name && { name: updateData.name }),
			...(updateData.bio && { bio: updateData.bio }),
			...(updateData.location && { location: updateData.location }),
			...(updateData.specialties && { specialties: updateData.specialties }),
			...(updateData.experience !== undefined && { experience: updateData.experience }),
			...(updateData.socials && { socials: updateData.socials }),
			...(updateData.verification && { verification: updateData.verification })
		}

		const updatedArtisan = await Artisan.findOneAndUpdate(
			{ userId: req.user._id },
			dbUpdate,
			{ new: true, runValidators: true }
		)

		if (!updatedArtisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		res.json({ message: 'Profile updated successfully' })
	} catch (error) {
		console.error('Error updating artisan profile:', error)
		res.status(500).json({ error: 'Failed to update artisan profile' })
	}
})

export default router


