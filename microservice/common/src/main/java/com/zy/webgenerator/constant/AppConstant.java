package com.zy.webgenerator.constant;

import com.zy.webgenerator.utils.ProjectPathUtils;

/**
 * 应用常量
 */
public interface AppConstant {

    /**
     * 精选应用的优先级
     */
    Integer GOOD_APP_PRIORITY = 99;

    /**
     * 默认应用优先级
     */
    Integer DEFAULT_APP_PRIORITY = 0;

    /**
     * 应用生成目录（自动定位仓库根目录，保证单体、微服务两种启动方式一致）
     */
    String CODE_OUTPUT_ROOT_DIR = ProjectPathUtils.getCodeOutputRootDir();

    /**
     * 应用部署目录（自动定位仓库根目录，必须和 nginx 挂载的目录保持一致）
     */
    String CODE_DEPLOY_ROOT_DIR = ProjectPathUtils.getCodeDeployRootDir();

    /**
     * 应用部署域名
     */
    String CODE_DEPLOY_HOST = "http://localhost";

}
