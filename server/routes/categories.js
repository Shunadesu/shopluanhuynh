import express from 'express';
import Category from '../models/Category.js';

const router = express.Router();

// Get all categories (active only) with subcategories
router.get('/', async (req, res) => {
  try {
    // Lấy tất cả categories đang active
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1 })
      .select('-__v');
    
    // Phân tách categories gốc (không có parentId) và subcategories (có parentId)
    const parentCategories = categories.filter(c => !c.parentId);
    const subcategoriesMap = {};
    
    categories.forEach(cat => {
      if (cat.parentId) {
        const parentId = cat.parentId.toString();
        if (!subcategoriesMap[parentId]) {
          subcategoriesMap[parentId] = [];
        }
        subcategoriesMap[parentId].push(cat);
      }
    });
    
    // Gắn subcategories vào mỗi category gốc
    const result = parentCategories.map(cat => {
      const catObj = cat.toObject();
      catObj.subcategories = subcategoriesMap[cat._id.toString()] || [];
      return catObj;
    });
    
    res.json(result);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get all categories (including inactive) - for admin
router.get('/all', async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ order: 1 })
      .select('-__v');
    
    // Phân tách categories gốc và subcategories
    const parentCategories = categories.filter(c => !c.parentId);
    const subcategoriesMap = {};
    
    categories.forEach(cat => {
      if (cat.parentId) {
        const parentId = cat.parentId.toString();
        if (!subcategoriesMap[parentId]) {
          subcategoriesMap[parentId] = [];
        }
        subcategoriesMap[parentId].push(cat);
      }
    });
    
    // Gắn subcategories vào mỗi category gốc
    const result = parentCategories.map(cat => {
      const catObj = cat.toObject();
      catObj.subcategories = subcategoriesMap[cat._id.toString()] || [];
      return catObj;
    });
    
    res.json(result);
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get category by slug
router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ 
      slug: req.params.slug,
      isActive: true 
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Danh mục không tồn tại' });
    }
    
    // Lấy subcategories nếu là category gốc
    const categoryObj = category.toObject();
    if (!category.parentId) {
      categoryObj.subcategories = await Category.find({ 
        parentId: category._id,
        isActive: true 
      }).sort({ order: 1 });
    }
    
    res.json(categoryObj);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get subcategories of a category
router.get('/:id/subcategories', async (req, res) => {
  try {
    const subcategories = await Category.find({ 
      parentId: req.params.id,
      isActive: true 
    }).sort({ order: 1 });
    
    res.json(subcategories);
  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Create category
router.post('/', async (req, res) => {
  try {
    const { parentId, name, slug } = req.body;

    // Validate parentId if provided
    if (parentId) {
      const parent = await Category.findById(parentId);
      if (!parent) {
        return res.status(400).json({ message: 'Danh mục cha không tồn tại' });
      }
      // Parent must be a root category (not a subcategory)
      if (parent.parentId) {
        return res.status(400).json({ message: 'Chỉ có thể thêm danh mục con vào danh mục gốc' });
      }
    }

    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    const { parentId } = req.body;

    // Prevent circular reference: cannot set parentId to itself or to a descendant
    if (parentId !== undefined) {
      if (parentId === req.params.id) {
        return res.status(400).json({ message: 'Danh mục không thể là danh mục cha của chính nó' });
      }

      // Check if the proposed parent is a descendant of this category
      const isDescendant = async (catId, targetId) => {
        const children = await Category.find({ parentId: catId });
        for (const child of children) {
          if (child._id.toString() === targetId) return true;
          if (await isDescendant(child._id.toString(), targetId)) return true;
        }
        return false;
      };

      if (await isDescendant(req.params.id, parentId)) {
        return res.status(400).json({ message: 'Không thể đặt danh mục cha thành danh mục con của chính nó' });
      }

      // New parent must be a root category
      if (parentId) {
        const parent = await Category.findById(parentId);
        if (!parent) {
          return res.status(400).json({ message: 'Danh mục cha không tồn tại' });
        }
        if (parent.parentId) {
          return res.status(400).json({ message: 'Chỉ có thể gán vào danh mục gốc' });
        }
      }
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after' }
    );

    if (!category) {
      return res.status(404).json({ message: 'Danh mục không tồn tại' });
    }

    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Danh mục không tồn tại' });
    }
    
    // Xóa các subcategories của category này
    await Category.deleteMany({ parentId: req.params.id });
    
    // Xóa category
    await Category.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Đã xóa danh mục và các danh mục con' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

export default router;
