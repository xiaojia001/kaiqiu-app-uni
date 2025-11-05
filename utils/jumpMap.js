export default function(item) {
	var url = '';
	const address = item.address;
	const latitude = item.latitude;
	const longitude = item.longitude;
	if (plus.os.name == 'Android') {
		var hasBaiduMap = plus.runtime.isApplicationExist({ pname: 'com.baidu.BaiduMap', action: 'baidumap://' });
		var hasAmap = plus.runtime.isApplicationExist({ pname: 'com.autonavi.minimap', action: 'androidamap://' });
		var urlBaiduMap = 'baidumap://map/marker?location=' + latitude + ',' + longitude + '&title=' + encodeURIComponent(address) + '&src=com.bailb.hbb';
		var urlAmap = 'androidamap://viewMap?sourceApplication=com.bailb.hbb&poiname=' + encodeURIComponent(address) + '&lat=' + latitude + '&lon=' + longitude + '&dev=0';
		if (hasAmap && hasBaiduMap) {
			plus.nativeUI.actionSheet({ title: '选择地图应用', cancel: '取消', buttons: [{ title: '百度地图' }, { title: '高德地图' }] }, function(e) {
				switch (e.index) {
					case 1:
						plus.runtime.openURL(urlBaiduMap);
						break;
					case 2:
						plus.runtime.openURL(urlAmap);
						break;
				}
			});
		} else if (hasAmap) {
			if (uni.getSystemInfoSync().platform == 'android') {
				this.$showModal({
						title: '公告',
						concent: '是否打开“高德地图”进行导航？',
						delCancel: false
					})
					.then(res => {
						plus.runtime.openURL(urlAmap);
					})
					.catch(res => {});
			} else {
				uni.showModal({
					title: '公告',
					content: '是否打开“高德地图”进行导航？',
					success: res => {
						if (res.confirm) {
							plus.runtime.openURL(urlAmap);
						}
					}
				});
			}
		} else if (hasBaiduMap) {
			if (uni.getSystemInfoSync().platform == 'android') {
				this.$showModal({
						title: '公告',
						concent: '是否打开“百度地图”进行导航？',
						delCancel: false
					})
					.then(res => {
						plus.runtime.openURL(urlBaiduMap);
					})
					.catch(res => {});
			} else {
				uni.showModal({
					title: '公告',
					content: '是否打开“百度地图”进行导航？',
					success: res => {
						if (res.confirm) {
							plus.runtime.openURL(urlBaiduMaps);
						}
					}
				});
			}
		} else {
			//如果是国外应用，应该优先使用这个，会启动google地图。这个接口不能统一坐标系，进入百度地图时会有偏差
			url = 'geo:' + latitude + ',' + longitude + '?q=' + encodeURIComponent(address);
			if (uni.getSystemInfoSync().platform == 'android') {
				this.$showModal({
						title: '公告',
						concent: '是否打开“GoogleMap”进行导航？',
						delCancel: false
					})
					.then(res => {
						plus.runtime.openURL(url);
					})
					.catch(res => {});
			} else {
				uni.showModal({
					title: '公告',
					content: '是否打开“GoogleMap”进行导航？',
					success: res => {
						if (res.confirm) {
							plus.runtime.openURL(url);
						}
					}
				});
			}
		}
	} else {
		// iOS上获取本机是否安装了百度高德地图，需要在manifest里配置，在manifest.json文件app-plus->distribute->apple->urlschemewhitelist节点下添加（如urlschemewhitelist:["iosamap","baidumap"]）
		plus.nativeUI.actionSheet({ title: '选择地图应用', cancel: '取消', buttons: [{ title: 'Apple地图' }, { title: '百度地图' }, { title: '高德地图' }] }, function(e) {
			switch (e.index) {
				case 1:
					url = 'http://maps.apple.com/?q=' + encodeURIComponent(address) + '&ll=' + latitude + ',' + longitude + '&spn=0.008766,0.019441';
					break;
				case 2:
					url = 'baidumap://map/marker?location=' + latitude + ',' + longitude + '&title=' + encodeURIComponent(address) + '&src=com.bailb.hbb';
					break;
				case 3:
					url = 'iosamap://viewMap?sourceApplication=com.bailb.hbb&poiname=' + encodeURIComponent(address) + '&lat=' + latitude + '&lon=' + longitude + '&dev=1';
					break;
				default:
					break;
			}
			if (url != '') {
				plus.runtime.openURL(url, e => {
					plus.nativeUI.alert('本机未安装指定的地图应用');
				});
			}
		});
	}
}