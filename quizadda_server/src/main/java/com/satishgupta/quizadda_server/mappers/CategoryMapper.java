package com.satishgupta.quizadda_server.mappers;

import com.satishgupta.quizadda_server.dto.category.CategoryRequest;
import com.satishgupta.quizadda_server.dto.category.CategoryResponse;
import com.satishgupta.quizadda_server.models.quizPortal.Category;

/**
 * Static helpers for {@link Category} <-> DTO conversion. Static is fine because
 * mapping has no dependencies; if conversion ever needs services, promote to a bean.
 */
public final class CategoryMapper {

    private CategoryMapper() { }

    public static Category toEntity(CategoryRequest req) {
        Category c = new Category();
        c.setTitle(req.title());
        c.setDescription(req.description());
        return c;
    }

    public static void applyTo(Category target, CategoryRequest req) {
        target.setTitle(req.title());
        target.setDescription(req.description());
    }

    public static CategoryResponse toResponse(Category c) {
        if (c == null) return null;
        return new CategoryResponse(c.getCatId(), c.getTitle(), c.getDescription());
    }
}
