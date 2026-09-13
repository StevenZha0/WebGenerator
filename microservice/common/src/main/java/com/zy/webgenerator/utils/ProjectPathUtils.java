package com.zy.webgenerator.utils;

import java.io.File;

/**
 * 项目路径工具
 * <p>
 * 单体服务和微服务的启动工作目录不同（仓库根目录 / microservice 目录），
 * 直接用 user.dir 拼接会导致两种启动方式读写不同的生成目录和部署目录，
 * 因此这里统一从工作目录逐级向上寻找仓库根，保证两种启动方式共用同一份数据。
 */
public class ProjectPathUtils {

    /**
     * 仓库根标记：同时存在 pom.xml 和 microservice/pom.xml 的目录即仓库根
     */
    private static final String ROOT_POM = "pom.xml";

    private static final String MICROSERVICE_DIR = "microservice";

    /**
     * 应用生成目录，可通过 -Dcode.output.dir 或环境变量 CODE_OUTPUT_DIR 覆盖
     */
    private static final String OUTPUT_DIR_PROPERTY = "code.output.dir";

    private static final String OUTPUT_DIR_ENV = "CODE_OUTPUT_DIR";

    private static final String OUTPUT_DIR_NAME = "tmp/code_output";

    /**
     * 应用部署目录，可通过 -Dcode.deploy.dir 或环境变量 CODE_DEPLOY_DIR 覆盖
     * 注意：该目录必须和 nginx 容器挂载的目录保持一致
     */
    private static final String DEPLOY_DIR_PROPERTY = "code.deploy.dir";

    private static final String DEPLOY_DIR_ENV = "CODE_DEPLOY_DIR";

    private static final String DEPLOY_DIR_NAME = "tmp/code_deploy";

    private ProjectPathUtils() {
    }

    /**
     * 获取应用生成根目录
     */
    public static String getCodeOutputRootDir() {
        return resolveDir(OUTPUT_DIR_PROPERTY, OUTPUT_DIR_ENV, OUTPUT_DIR_NAME);
    }

    /**
     * 获取应用部署根目录
     */
    public static String getCodeDeployRootDir() {
        return resolveDir(DEPLOY_DIR_PROPERTY, DEPLOY_DIR_ENV, DEPLOY_DIR_NAME);
    }

    /**
     * 获取仓库根目录：从当前工作目录逐级向上查找，找不到标记时退回工作目录
     */
    public static File getProjectRootDir() {
        File dir = new File(System.getProperty("user.dir")).getAbsoluteFile();
        while (dir != null) {
            if (isRepoRoot(dir)) {
                return dir;
            }
            dir = dir.getParentFile();
        }
        return new File(System.getProperty("user.dir")).getAbsoluteFile();
    }

    /**
     * 优先使用显式配置的目录，未配置时按仓库根目录推导
     */
    private static String resolveDir(String propertyName, String envName, String subDir) {
        String configured = System.getProperty(propertyName);
        if (isBlank(configured)) {
            configured = System.getenv(envName);
        }
        if (!isBlank(configured)) {
            return new File(configured).getAbsolutePath();
        }
        return new File(getProjectRootDir(), subDir).getAbsolutePath();
    }

    private static boolean isRepoRoot(File dir) {
        return new File(dir, ROOT_POM).isFile()
                && new File(new File(dir, MICROSERVICE_DIR), ROOT_POM).isFile();
    }

    private static boolean isBlank(String str) {
        return str == null || str.trim().isEmpty();
    }
}
