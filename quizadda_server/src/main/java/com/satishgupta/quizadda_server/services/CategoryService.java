package com.satishgupta.quizadda_server.services;

import com.satishgupta.quizadda_server.models.quizPortal.Category;

import java.util.List;

public interface CategoryService {

    public Category addCategory(Category category);

    public Category updateCategory(Category category);

    public List<Category> getCategories();

    public Category getCategory(Long categoryId);

    public void deleteCategory(Long categoryId);
}
