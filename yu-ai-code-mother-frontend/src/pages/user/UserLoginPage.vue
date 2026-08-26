<template>
  <div id="userLoginPage">
    <h2 class="title">AI智能网站生成助手 - 用户登录</h2>
    <div class="desc">不写一行代码，生成完整应用</div>
    <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">
      <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
        <a-input v-model:value="formState.userAccount" placeholder="请输入账号" />
      </a-form-item>
      <a-form-item
        name="userPassword"
        :rules="[
          { required: true, message: '请输入密码' },
          { min: 8, message: '密码长度不能小于 8 位' },
        ]"
      >
        <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" />
      </a-form-item>
      <div class="tips">
        没有账号
        <RouterLink to="/user/register">去注册</RouterLink>
      </div>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">登录</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import { reactive } from 'vue'
import { userLogin } from '@/api/userController.ts'
import { useLoginUserStore } from '@/stores/loginUser.ts'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'

const formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
})

const router = useRouter()
const loginUserStore = useLoginUserStore()

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  const res = await userLogin(values)
  // 登录成功，把登录态保存到全局状态中
  if (res.data.code === 0 && res.data.data) {
    await loginUserStore.fetchLoginUser()
    message.success('登录成功')
    router.push({
      path: '/',
      replace: true,
    })
  } else {
    message.error('登录失败，' + res.data.message)
  }
}
</script>

<style scoped>
#userLoginPage {
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
  text-align: right;
  color: var(--tech-text-muted);
  font-size: 13px;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  #userLoginPage {
    margin: 24px 16px;
    padding: 28px 20px;
  }

  .title {
    font-size: 20px;
  }
}
</style>
