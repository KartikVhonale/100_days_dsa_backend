import { dbService } from '../config/db.js';

export async function listPatterns(req, res) {
  try {
    const { category, search } = req.query;
    let patterns = await dbService.getPatterns();

    if (category && category !== 'All') {
      patterns = patterns.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const s = search.toLowerCase();
      patterns = patterns.filter(p =>
        p.name.toLowerCase().includes(s) ||
        p.signature.toLowerCase().includes(s) ||
        p.dataStructure.toLowerCase().includes(s)
      );
    }

    return res.status(200).json({ success: true, data: patterns });
  } catch (error) {
    console.error('[PatternController] listPatterns error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function createPattern(req, res) {
  try {
    const { name, category, signature, dataStructure, timeComplexity, spaceComplexity, keyInsights, codeTemplate, exampleProblems } = req.body;
    if (!name || !signature || !dataStructure) {
      return res.status(400).json({ success: false, error: 'name, signature, and dataStructure are required' });
    }

    const newPattern = await dbService.addPattern({
      name,
      category: category || 'General Patterns',
      signature,
      dataStructure,
      timeComplexity: timeComplexity || 'O(N)',
      spaceComplexity: spaceComplexity || 'O(1)',
      keyInsights: Array.isArray(keyInsights) ? keyInsights : [keyInsights || ''],
      codeTemplate: codeTemplate || '',
      exampleProblems: Array.isArray(exampleProblems) ? exampleProblems : []
    });

    return res.status(201).json({ success: true, data: newPattern });
  } catch (error) {
    console.error('[PatternController] createPattern error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
