package com.satishgupta.quizadda_server.services;

import com.satishgupta.quizadda_server.dto.category.CategoryRequest;
import com.satishgupta.quizadda_server.dto.category.CategoryResponse;

import java.util.List;

/**
 * Business operations on quiz categories. All implementations are expected to
 * throw {@link com.satishgupta.quizadda_server.exceptions.ResourceNotFoundException}
 * when a referenced category does not exist.
 */
public interface CategoryService {

    /** Persists a new category and returns the saved representation including the generated id. */
    CategoryResponse addCategory(CategoryRequest request);

    /** Replaces an existing category's mutable fields. Throws 404 if not found. */
    CategoryResponse updateCategory(Long categoryId, CategoryRequest request);

    List<CategoryResponse> getCategories();

    CategoryResponse getCategory(Long categoryId);

    /** Cascades to the category's quizzes and their questions (orphanRemoval=true on the relation). */
    void deleteCategory(Long categoryId);
}
