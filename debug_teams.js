// 模拟前端API调用，检查问题
import axios from 'axios';

async function debugTeamsAPI() {
  console.log('开始调试团队管理API...\n');

  // 1. 首先登录获取管理员token
  try {
    const loginResponse = await axios.post('http://localhost:8080/api/auth/admin/login', {
      username: 'system_admin',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ 管理员登录成功');
    console.log('Token:', token.substring(0, 20) + '...\n');

    // 2. 测试获取待审核团队
    console.log('测试获取待审核团队...');
    const pendingResponse = await axios.get('http://localhost:8080/api/admin/teams/pending', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ 待审核团队API响应:');
    console.log('状态码:', pendingResponse.status);
    console.log('团队数量:', pendingResponse.data.teams.length);
    console.log('总数量:', pendingResponse.data.total);
    console.log('团队数据:', JSON.stringify(pendingResponse.data.teams, null, 2));

    // 3. 测试获取所有团队（带pending筛选）
    console.log('\n测试获取所有团队（带pending筛选）...');
    const allTeamsResponse = await axios.get('http://localhost:8080/api/admin/teams?status=pending', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ 所有团队API响应（pending筛选）:');
    console.log('状态码:', allTeamsResponse.status);
    console.log('团队数量:', allTeamsResponse.data.teams.length);
    console.log('总数量:', allTeamsResponse.data.total);

    // 4. 测试获取所有团队（无筛选）
    console.log('\n测试获取所有团队（无筛选）...');
    const allTeamsNoFilter = await axios.get('http://localhost:8080/api/admin/teams', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ 所有团队API响应（无筛选）:');
    console.log('状态码:', allTeamsNoFilter.status);
    console.log('团队数量:', allTeamsNoFilter.data.teams.length);
    console.log('总数量:', allTeamsNoFilter.data.total);

  } catch (error) {
    console.error('❌ API调用失败:');
    if (error.response) {
      console.log('状态码:', error.response.status);
      console.log('错误信息:', error.response.data);
    } else {
      console.log('错误:', error.message);
    }
  }
}

debugTeamsAPI();