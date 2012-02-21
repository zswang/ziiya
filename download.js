/*
 * 使用方法
 * cscript.exe //E:jscript download.js http://nodejs.org/dist/v0.6.5/node.exe node.exe
 */
void function(){
	
	/**
	 * @author 王集鹄(wangjihu,http://weibo.com/zswang)
	 * @fileoverview 简单断点续传的本地脚本
	 * @version 1.0.0
	 * @date 2012.1.30
	 */
	var console = {
		log: function(info){
			WScript.StdOut.WriteLine(info);
		}
	};
	/*
	 * 获取网络文件大小
	 */
	function getContentLength(url){
		console.log(['HEAD ', url, " => ", " wait..."].join(''));
		var xmlhttp = new ActiveXObject("WinHttp.WinHttpRequest.5.1");
		xmlhttp.open("HEAD", url, false);
		xmlhttp.setRequestHeader("Referer", url); 
		xmlhttp.send();
		var result = -1;
		xmlhttp.GetAllResponseHeaders().replace(/\bContent-Length:\s*(\d+)/, function(all, length){
			result = +length;
		});
		console.log(['Content-Length: ', result].join(''));
		return result;
	}
	
	/*
	 * 文件是否存在
	 */
	function fileExists(filename){
		if (!filename) return;
		var fso = new ActiveXObject('Scripting.FileSystemObject');
		try {
			return fso.FileExists(filename);
		} catch (ex) {
			console.log(ex.message);
		} finally {
			fso = null;
		}
	}
	/*
	 * 返回文件大小
	 */
	function fileSize(filename){
		if (!filename) return;
		var fso = new ActiveXObject('Scripting.FileSystemObject');
		try {
			return fso.GetFile(filename).size;
		} catch (ex) {
			console.log(ex.message);
			return -1;
		} finally {
			fso = null;
		}
	}
	/*
	 * 下载指定大小的内容
	 */
	function download(url, filename, range){
		var xmlhttp = new ActiveXObject("WinHttp.WinHttpRequest.5.1");
		xmlhttp.open("GET", url, false);
		xmlhttp.setRequestHeader("Referer", url); 
		xmlhttp.setRequestHeader("RANGE", 'bytes=' + range.join('-')); 
		xmlhttp.send();
		var adodbStream = new ActiveXObject("ADODB.Stream");
		adodbStream.Type = 1;
		adodbStream.Open();
		if (fileExists(filename)){
			adodbStream.LoadFromFile(filename);
			adodbStream.position = adodbStream.size;
		}
		adodbStream.Write(xmlhttp.responseBody);
		adodbStream.SaveToFile(filename, 2); 
		adodbStream.Close(); 
		adodbStream = null;
	}
	
	var pageSize = 1024 * 1024; // 每次下载1M
	/*
	 * 开始下载
	 */
	function process(url, filename){
		var size = Math.max(fileSize(filename), 0);
		var length = getContentLength(url);
		if (size > 0 && size == length){
			console.log('download complete.');
			return;
		}
		while(size < length){
			console.log(['download progress: ', size, '/', length, ' byte'].join(''));
			download(url, filename, [size, Math.min(size + pageSize - 1, length)]);
			size += pageSize;
		}
		console.log('download complete.');
	}
	if (WScript.Arguments.Length < 2){
		console.log('params: <url>, <filename>');
		return;
	}
	process(WScript.Arguments(0), WScript.Arguments(1));
}();