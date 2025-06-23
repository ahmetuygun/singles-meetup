package com.meet.singles.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties specific to Singles Meetup 2.
 * <p>
 * Properties are configured in the {@code application.yml} file.
 * See {@link tech.jhipster.config.JHipsterProperties} for a good example.
 */
@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
public class ApplicationProperties {

    // jhipster-needle-application-properties-property

    // jhipster-needle-application-properties-property-getter
    // jhipster-needle-application-properties-property-class
}
