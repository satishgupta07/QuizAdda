package com.satishgupta.quizadda_server.models;

import org.springframework.security.core.GrantedAuthority;

/**
 * Lightweight {@link GrantedAuthority} adapter used by {@link User#getAuthorities()}.
 */
public record Authority(String authority) implements GrantedAuthority {

    @Override
    public String getAuthority() {
        return authority;
    }
}
