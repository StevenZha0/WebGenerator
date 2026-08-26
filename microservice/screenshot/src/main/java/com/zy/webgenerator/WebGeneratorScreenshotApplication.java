package com.zy.webgenerator;

import org.apache.dubbo.config.spring.context.annotation.EnableDubbo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@EnableDubbo
@SpringBootApplication
public class WebGeneratorScreenshotApplication {
    public static void main(String[] args) {
        SpringApplication.run(WebGeneratorScreenshotApplication.class, args);
    }
}
