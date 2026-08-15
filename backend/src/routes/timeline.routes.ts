import { Router } from 'express';
import { TimelineService } from '../services/timeline.service';

const router = Router();

// GET /api/v1/timeline - Get all timeline milestones
router.get('/', async (_req, res) => {
  try {
    const data = await TimelineService.getAll();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/timeline - Create new milestone
router.post('/', async (req, res) => {
  try {
    const data = await TimelineService.create(req.body);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/v1/timeline - Save all milestones
router.put('/', async (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : req.body.items || [];
    const data = await TimelineService.saveAll(items);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/v1/timeline/:id - Delete milestone
router.delete('/:id', async (req, res) => {
  try {
    const data = await TimelineService.delete(req.params.id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
