<template>
  <div id="userRegisterPage">
    <h2 class="title">AI智能网站生成助手 - 用户注册</h2>
    <div class="desc">不写一行代码，生成完整应用</div>
    <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">
      <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
        <a-input v-model:value="formState.userAccount" placeholder="请输入账号" />
      </a-form-item>
      <a-form-item
        name="userPassword"
        :rules="[
          { required: true, message: '请输入密码' },
          { min: 8, message: '密码不能小于 8 位' },
        ]"
      >
        <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" />
      </a-form-item>
      <a-form-item
        name="checkPassword"
        :rules="[
          { required: true, message: '请确认密码' },
          { min: 8, message: '密码不能小于 8 位' },
          { validator: validateCheckPassword },
        ]"
      >
        <a-input-password v-model:value="formState.checkPassword" placeholder="请确认密码" />
      </a-form-item>
      <div class="tips">
        已有账号？
        <RouterLink to="/user/login">去登录</RouterLink>
      </div>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">注册</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { userRegister } from '@/api/userController.ts'
import { message } from 'ant-design-vue'
import { reactive } from 'vue'

const router = useRouter()

const formState = reactive<API.UserRegisterRequest>({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
})

/**
 * 验证确认密码
 * @param rule
 * @param value
 * @param callback
 */
const validateCheckPassword = (rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (value && value !== formState.userPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: API.UserRegisterRequest) => {
  const res = await userRegister(values)
  // 注册成功，跳转到登录页面
  if (res.data.code === 0) {
    message.success('注册成功')
    router.push({
      path: '/user/login',
      replace: true,
    })
  } else {
    message.error('注册失败，' + res.data.message)
  }
}
</script>

<style scoped>
#userRegisterPage {
  max-width: 720px;
  padding: 40px;
  margin: 56px auto;
  background:
    linear-gradient(135deg, rgba(20, 120, 255, 0.04), rgba(6, 182, 212, 0.02)),
    var(--tech-surface);
  border: 1px solid var(--tech-border);
  border-radius: var(--tech-radius-lg);
  box-shadow: var(--tech-shadow-md);
  backdrop-filter: blur(18px);
}

.title {
  text-align: center;
  margin-bottom: 16px;
  color: var(--tech-text);
  font-weight: 650;
}

.desc {
  text-align: center;
  color: var(--tech-text-secondary);
  margin-bottom: 28px;
}

.tips {
  margin-bottom: 16px;
  color: var(--tech-text-muted);
  font-size: 13px;
  text-align: right;
}

@media (max-width: 768px) {
  #userRegisterPage {
    margin: 24px 16px;
    padding: 28px 20px;
  }

  .title {
    font-size: 20px;
  }
}
</style>
