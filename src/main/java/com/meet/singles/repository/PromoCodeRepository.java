package com.meet.singles.repository;

import com.meet.singles.domain.PromoCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PromoCodeRepository extends JpaRepository<PromoCode, UUID> {

    @Query("SELECT p FROM PromoCode p WHERE UPPER(p.code) = UPPER(:code)")
    Optional<PromoCode> findByCodeIgnoreCase(@Param("code") String code);

    Optional<PromoCode> findByCode(String code);
} 