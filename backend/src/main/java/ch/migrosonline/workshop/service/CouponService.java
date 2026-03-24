package ch.migrosonline.workshop.service;

import ch.migrosonline.workshop.model.CouponResponse;
import ch.migrosonline.workshop.repository.CouponRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CouponService {

  private final CouponRepository couponRepository;

  @Transactional(readOnly = true)
  public CouponResponse validateCoupon(String code) {
    var coupon =
        couponRepository
            .findByCodeAndActiveTrue(code)
            .orElseThrow(
                () -> new EntityNotFoundException("Coupon not found or inactive: " + code));
    return new CouponResponse(
        coupon.getCode(), coupon.getType(), coupon.getValue(), coupon.getDescription());
  }
}
