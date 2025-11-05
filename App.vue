<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			uni.onTabBarMidButtonTap(() => {
				uni.navigateTo({
					url: '/pages/search/topSearch'
				})
			})
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
	page {
		background-color: #F2F0F2;
	}
</style>