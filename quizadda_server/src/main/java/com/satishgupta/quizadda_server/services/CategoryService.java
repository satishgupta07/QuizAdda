package com.satishgupta.quizadda_server.services;

import com.satishgupta.quizadda_server.dto.category.CategoryRequest;
import com.satishgupta.quizadda_server.dto.category.CategoryResponse;

import java.util.List;

public interface CategoryService {

    CategoryResponse addCategory(CategoryRequest request);

    CategoryResponse updateCategory(Long categoryId, CategoryRequest request);

    List<CategoryResponse> getCategories();

    CategoryResponse getCategory(Long categoryId);

    void deleteCategory(Long categoryId);
}
