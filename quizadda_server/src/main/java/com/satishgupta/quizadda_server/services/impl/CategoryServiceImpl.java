package com.satishgupta.quizadda_server.services.impl;

import com.satishgupta.quizadda_server.dto.category.CategoryRequest;
import com.satishgupta.quizadda_server.dto.category.CategoryResponse;
import com.satishgupta.quizadda_server.exceptions.ResourceNotFoundException;
import com.satishgupta.quizadda_server.mappers.CategoryMapper;
import com.satishgupta.quizadda_server.models.quizPortal.Category;
import com.satishgupta.quizadda_server.repositories.CategoryRepository;
import com.satishgupta.quizadda_server.services.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public CategoryResponse addCategory(CategoryRequest request) {
        Category saved = categoryRepository.save(CategoryMapper.toEntity(request));
        return CategoryMapper.toResponse(saved);
    }

    @Override
    public CategoryResponse updateCategory(Long categoryId, CategoryRequest request) {
        Category existing = findCategoryOrThrow(categoryId);
        CategoryMapper.applyTo(existing, request);
        return CategoryMapper.toResponse(categoryRepository.save(existing));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories() {
        return categoryRepository.findAll().stream()
                .map(CategoryMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategory(Long categoryId) {
        return CategoryMapper.toResponse(findCategoryOrThrow(categoryId));
    }

    @Override
    public void deleteCategory(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category", "id", categoryId);
        }
        categoryRepository.deleteById(categoryId);
    }

    private Category findCategoryOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }
}
