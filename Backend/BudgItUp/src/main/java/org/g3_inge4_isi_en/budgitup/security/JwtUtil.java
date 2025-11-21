package org.g3_inge4_isi_en.budgitup.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class JwtUtil {

    private final JwtProperties jwtProperties;

    private Key getKey() {
        return Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes());
    }

    public String generateToken(String email, Long userId, int tokenVersion) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + jwtProperties.getExpiration());

        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(exp)
                .addClaims(Map.of(
                        "userId", userId,
                        "tokenVersion", tokenVersion
                ))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Jws<Claims> parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token);
    }

    public boolean isTokenValid(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String getEmailFromToken(String token) {
        return parseToken(token).getBody().getSubject();
    }

    public Long getUserIdFromToken(String token) {
        Object v = parseToken(token).getBody().get("userId");
        if (v instanceof Integer) return ((Integer) v).longValue();
        if (v instanceof Long) return (Long) v;
        return null;
    }

    public Integer getTokenVersionFromToken(String token) {
        Object v = parseToken(token).getBody().get("tokenVersion");
        if (v instanceof Integer) return (Integer) v;
        if (v instanceof Long) return ((Long) v).intValue();
        return null;
    }
}
