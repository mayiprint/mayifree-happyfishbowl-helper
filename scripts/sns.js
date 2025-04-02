function sendStoryByStreamImplPro(feedName, storyType, storyStr, callback){
    var url = "title=" + storyStr['title'] + "&jump="+ encodeURIComponent(storyStr['url']) + "&appId="+ storyStr['appId']  + "&image="+ storyStr['image'] + "&description="+ storyStr['description']
    
    if(!document.getElementById("open_box")){
    	var fm_help = document.getElementById("fm_help");
    	fm_help.insertAdjacentHTML("afterend","<div id=\"open_box\"></div>");
    }
    document.getElementById("open_box").innerHTML = "<div style=\"float: left; width: 97%; height: 120px; background-color: #F6F6F6; padding: 10px 10px 10px 10px; margin-top: 10px;\">\
    <div class=\"img\" style=\"width: 120px; float: left;\">\
     <img width=\"100%\"  src=\"" + storyStr['image'] + "\">\
    </div>\
    <div class=\"msg\" style=\"width: 570px; margin-left: 10px;text-align: left;float: left;padding:10px;\">\
        <div><p style=\"font-size: 10px;\">FISH.MAYIFREE.COM</p><p style=\"font-size: 17px;color: #000000;\">" + storyStr['title'] +"</p></div> \
        <div class=\"chars\">\
        <p style=\"font-size: 12px;color: #808080;\">" + storyStr['description']+"</p>\
        <div style=\"text-align: right;\">\
        <a type=\"button\" style=\"background-color: #8E8E8E; color: white; display: inline-block; text-align: center; border: none; padding: 4px 8px;margin: 0 2px; border-radius: 3px;\" href='http://fish.mayifree.com/?url=" + encodeURIComponent(storyStr['url']) + "' target=\"_blank\" \">MayiFree-開啟連結</a>\
        <a type=\"button\" style=\"background-color: #8E8E8E; color: white; display: inline-block; text-align: center; border: none; padding: 4px 8px;margin: 0 2px; border-radius: 3px;\" href='" + 'https://fishbowl.he-games.com/share.jsp?' + url + "' target=\"_blank\" \">打開連結</a>\
        <a type=\"button\" style=\"background-color: #8E8E8E; color: white; display: inline-block; text-align: center; border: none; padding: 4px 8px;margin: 0 2px; border-radius: 3px;\" onclick=\"shareStory('" + url + "')\" >原始分享</a>\
        </div>\
        </div>\
        </div>\
    </div>";
    if(HEGlobal.flashVars.isH5Ready){
        HE.ExternalInterface.invokeCallback(callback,true);
    }
}
function shareStory(url){
    FB.ui({
        method: 'share',
        href: 'https://fishbowl.he-games.com/share.jsp?' + url,
    }, function(response){
    });
}