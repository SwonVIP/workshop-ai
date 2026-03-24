package ch.migrosonline.workshop.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import ch.migrosonline.workshop.model.CouponResponse;
import ch.migrosonline.workshop.model.CouponValidateRequest;
import ch.migrosonline.workshop.service.CouponService;
import ch.migrosonline.workshop.support.ControllerTestSupport;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@WebMvcTest(CouponController.class)
class CouponControllerTest extends ControllerTestSupport {

  @MockitoBean private CouponService couponService;

  @Test
  void shouldReturnCouponWhenValidCodeProvided() throws Exception {
    // given
    var couponResponse =
        new CouponResponse("WELCOME10", "PERCENTAGE", new BigDecimal("10"), "10% off your order");
    when(couponService.validateCoupon("WELCOME10")).thenReturn(couponResponse);
    var requestBody = jsonMapper.writeValueAsString(new CouponValidateRequest("WELCOME10"));

    // when
    var result =
        mvc.post()
            .uri("/api/coupons/validate")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody)
            .exchange();

    // then
    assertThat(result).hasStatusOk();
    assertThat(result).bodyJson().extractingPath("code").isEqualTo("WELCOME10");
    assertThat(result).bodyJson().extractingPath("type").isEqualTo("PERCENTAGE");
    assertThat(result).bodyJson().extractingPath("value").isEqualTo(10);
    assertThat(result).bodyJson().extractingPath("description").isEqualTo("10% off your order");
  }

  @Test
  void shouldReturn404WhenCouponNotFound() throws Exception {
    // given
    when(couponService.validateCoupon("INVALID"))
        .thenThrow(new EntityNotFoundException("Coupon not found or inactive: INVALID"));
    var requestBody = jsonMapper.writeValueAsString(new CouponValidateRequest("INVALID"));

    // when
    var result =
        mvc.post()
            .uri("/api/coupons/validate")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody)
            .exchange();

    // then
    assertThat(result).hasStatus(HttpStatus.NOT_FOUND);
    assertThat(result).bodyJson().extractingPath("status").isEqualTo(404);
    assertThat(result).bodyJson().extractingPath("error").isEqualTo("Not Found");
    assertThat(result)
        .bodyJson()
        .extractingPath("message")
        .isEqualTo("Coupon not found or inactive: INVALID");
  }

  @Test
  void shouldReturn400WhenCodeIsBlank() throws Exception {
    // given
    var requestBody = jsonMapper.writeValueAsString(new CouponValidateRequest(""));

    // when
    var result =
        mvc.post()
            .uri("/api/coupons/validate")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody)
            .exchange();

    // then
    assertThat(result).hasStatus(HttpStatus.BAD_REQUEST);
  }

  @Test
  void shouldReturn400WhenCodeIsMissing() throws Exception {
    // given
    var requestBody = "{}";

    // when
    var result =
        mvc.post()
            .uri("/api/coupons/validate")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody)
            .exchange();

    // then
    assertThat(result).hasStatus(HttpStatus.BAD_REQUEST);
  }

  @Test
  void shouldReturnFixedAmountCoupon() throws Exception {
    // given
    var couponResponse =
        new CouponResponse("SAVE5", "FIXED_AMOUNT", new BigDecimal("5"), "CHF 5 off");
    when(couponService.validateCoupon("SAVE5")).thenReturn(couponResponse);
    var requestBody = jsonMapper.writeValueAsString(new CouponValidateRequest("SAVE5"));

    // when
    var result =
        mvc.post()
            .uri("/api/coupons/validate")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody)
            .exchange();

    // then
    assertThat(result).hasStatusOk();
    assertThat(result).bodyJson().extractingPath("code").isEqualTo("SAVE5");
    assertThat(result).bodyJson().extractingPath("type").isEqualTo("FIXED_AMOUNT");
    assertThat(result).bodyJson().extractingPath("value").isEqualTo(5);
    assertThat(result).bodyJson().extractingPath("description").isEqualTo("CHF 5 off");
  }

  @Test
  void shouldReturn500WhenServiceThrowsUnexpectedException() throws Exception {
    // given
    when(couponService.validateCoupon("BOOM"))
        .thenThrow(new RuntimeException("Unexpected failure"));
    var requestBody = jsonMapper.writeValueAsString(new CouponValidateRequest("BOOM"));

    // when
    var result =
        mvc.post()
            .uri("/api/coupons/validate")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody)
            .exchange();

    // then
    assertThat(result).hasStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    assertThat(result).bodyJson().extractingPath("status").isEqualTo(500);
    assertThat(result).bodyJson().extractingPath("error").isEqualTo("Internal Server Error");
  }
}
