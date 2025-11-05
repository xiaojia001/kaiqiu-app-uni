<template>
	<view>
		<hao-indexList v-if="letters.length" :letters="letters" :currentCity="crtSelect" :hotCity="citySelectHis" :cityList="cityList" @haoTap="haoTap">
		</hao-indexList>
	</view>
</template>

<script setup>
	import haoIndexList from '@/components/hao-indexList/hao-indexList.vue'
	import { getCities } from '@/api/publicc.js'
	const { setSelectCity, selectCity, citySelectHis, setCitySelectHis } = useStore('user')
	const crtSelect = ref({})
	const letters = ref([])
	const cityList = ref([])
	let isTemp = false
	onLoad(({ id, name, temp }) => {
		if (id && name || temp) {
			isTemp = true
			crtSelect.value = { id, name }
		} else {
			crtSelect.value = { id: selectCity.value.id, name: selectCity.value.name }
		}
		getCities().then(res => {
			const indexCitys = res.data ?? []
			letters.value = indexCitys.map(v => v.letter)
			cityList.value = indexCitys.reduce((all, crt) => {
				all[crt.letter] = crt.list
				return all
			}, {})
		})
	})

	function haoTap(item) {
		if (!isTemp) {
			const { id, name } = item
			setSelectCity({ id, name })
			setCitySelectHis({ id, name })
		}
		setTimeout(() => {
			uni.$emit('refreshCity', item)
		}, 500)
		uni.navigateBack({ delta: 1 })
	}
</script>

<style>

</style>