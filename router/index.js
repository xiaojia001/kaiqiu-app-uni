import { createRouter } from 'uni-mini-router'
const router = createRouter({
	routes: [...ROUTES] // 路由表信息
})
router.beforeEach((to, from, next) => {
	// if (to.path.includes('map/index')) {
	// 	uni.showToast({
	// 		title: '跳转成功',
	// 		icon: 'none'
	// 	})
	// 	next()
		
	// 	return
	// }
	// next入参 false 以取消导航
	next()
})
export default router