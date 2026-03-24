package ch.migrosonline.workshop.controller;

import ch.migrosonline.workshop.model.CouponResponse;
import ch.migrosonline.workshop.model.CouponValidateRequest;
import ch.migrosonline.workshop.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

  private final CouponService couponService;

  @PostMapping("/validate")
  public CouponResponse validateCoupon(@Valid @RequestBody CouponValidateRequest request) {
    return couponService.validateCoupon(request.code());
  }
}
