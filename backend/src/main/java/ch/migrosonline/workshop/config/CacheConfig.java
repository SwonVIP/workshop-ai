package ch.migrosonline.workshop.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import java.util.concurrent.TimeUnit;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {

  public static final String CATEGORIES_CACHE = "categories";

  @Bean
  public CacheManager cacheManager() {
    CaffeineCacheManager cacheManager = new CaffeineCacheManager(CATEGORIES_CACHE);
    cacheManager.setCaffeine(
        Caffeine.newBuilder().expireAfterWrite(1, TimeUnit.HOURS).maximumSize(100));
    return cacheManager;
  }
}
