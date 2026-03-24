package ch.migrosonline.workshop.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import lombok.*;

@Entity
@Table(name = "customer")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(name = "password_hash", nullable = false)
  private String passwordHash;

  @Setter
  @Column(name = "first_name", nullable = false)
  private String firstName;

  @Setter
  @Column(name = "last_name", nullable = false)
  private String lastName;

  @Setter private String phone;

  @Setter private String street;

  @Setter private String apartment;

  @Setter private String city;

  @Setter
  @Column(name = "postal_code")
  private String postalCode;

  @Column(name = "created_at")
  private OffsetDateTime createdAt;

  @PrePersist
  void prePersist() {
    if (createdAt == null) {
      createdAt = OffsetDateTime.now();
    }
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    CustomerEntity that = (CustomerEntity) o;
    return email != null && email.equals(that.email);
  }

  @Override
  public int hashCode() {
    return email != null ? email.hashCode() : 0;
  }
}
