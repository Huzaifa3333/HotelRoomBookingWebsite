package com.example.HotelRoomBookingSystem.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthFilter jwtAuthFilter;
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)throws Exception{
        http
        .cors(org.springframework.security.config.Customizer.withDefaults())
        .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(authorizeRequest ->
                        authorizeRequest
                                .requestMatchers(
                                        "/",
                                        "/index.html",
                                        "/pages/**",
                                        "/css/**",
                                        "/javascript/**"
                                ).permitAll()
                                .requestMatchers("/api/admin/register").denyAll()
                                .requestMatchers("/api/admin/login").permitAll()
                                .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/rooms", "/api/rooms/**").permitAll()
                                .requestMatchers("/api/rooms", "/api/rooms/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.GET, "/api/booking/all").hasRole("ADMIN")
                                .requestMatchers("/api/admin/dashboard/**").hasRole("ADMIN")
                                .anyRequest().authenticated()
                );
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
        }
        @Bean
        public PasswordEncoder passwordEncoder(){
            return new BCryptPasswordEncoder();
        }
    }

