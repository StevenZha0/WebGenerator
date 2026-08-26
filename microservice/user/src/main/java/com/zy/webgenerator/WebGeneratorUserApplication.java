package com.zy.webgenerator;

import org.apache.dubbo.config.spring.context.annotation.EnableDubbo;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@MapperScan("com.zy.webgenerator.mapper")
@ComponentScan("com.zy.webgenerator")
@EnableDubbo
public class WebGeneratorUserApplication {
    public static void main(String[] args) {
        SpringApplication.run(WebGeneratorUserApplication.class, args);
    }
}
