<template>
	<view class="p20rpx bg-#fff text-#77B980 text-30rpx full-height box-border">
		<view>比赛名称: {{info.title}}</view>
		<view class="mt-12rpx">项目名称: {{info.xianmu}}</view>
		<view class="mt-12rpx">比赛费用: <text class="text-#F89703">{{info.fee_sum}}元</text></view>
		<view>
			<zb-table class="mt-22rpx" show-heade :columns="columns" stripe :fit="false" border :data="info.list" :cell-style="setCellStyle" :cell-header-style="setCellHeaderStyle">
				<template #name="{row}">
					<text class="text-#E6326E" v-if="row.role==5">*</text>
					<text>{{row.name}}</text>
				</template>
			</zb-table>
		</view>
		<view class="mt-22rpx">
			<button type="primary" @click="cancelSignUp">取消报名</button>
		</view>

	</view>
</template>

<script setup>
	import { getEnterinfo, cancelEnter } from '@/api/event.js'
	const columns = [{
			type: 'index',
			label: '序号',
			width: uni.upx2px(140),
			align: 'center',
			emptyString: ' '
		},
		{
			type: 'slot',
			name: 'username',
			label: '参赛人',
			width: uni.upx2px(260),
			align: 'center'
		},
		{
			name: 'score',
			label: '积分',
			align: 'center',
			width: uni.upx2px(140)
		},
		{
			name: 'status',
			label: '状态',
			align: 'center',
			filters: {
				0: '交费处理中',
				1: '已交付',
				2: '已报名'
			},
			width: uni.upx2px(140)
		}
	]
	const info = ref({
		list: []
	})
	let match_itemid = null
	onLoad(({ id }) => {
		match_itemid = id
		getEnterinfo(id).then(res => {
			info.value = res.data
		})
	})

	function setCellHeaderStyle({ column, columnIndex }) {
		return {
			fontSize: '24rpx',
			paddingLeft: '0px',
			paddingRight: '0px'
		};
	}

	function setCellStyle({ row, column, rowIndex, columnIndex }) {
		let obj = {
			fontSize: '24rpx',
			paddingLeft: '0px',
			paddingRight: '0px'
		};
		return obj;
	}

	function cancelSignUp() {
		uni.showModal({
			title: '提示',
			content: '确认要取消报名吗?',
			success: async ({
				confirm
			}) => {
				if (!confirm) return
				const { id, match_id } = info.value
				cancelEnter({ enter_id: id, match_id, match_itemid, xian_status: 0, tag: 1 }).then(res => {
					uni.showToast({
						title: '取消报名成功',
						icon: 'none'
					})
					setTimeout(() => {
						uni.navigateBack({ delta: 1 })
					}, 600)
				})
			}
		});
	}
</script>

<style lang="scss" scoped>
	.full-height {
		/* #ifdef APP */
		height: 100vh;
		/* #endif */
		/* #ifdef H5 */
		height: calc(100vh - var(--window-top));
		/* #endif */
	}
</style>