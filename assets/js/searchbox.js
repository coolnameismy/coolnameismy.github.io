/**
 * Created by zteliuyw on 15/5/28.
 */
$(function(){


    //搜索框文字变化时间
    $("#search-input").keyup(function(){
        //$("#s-box").hide("slow");
        var text = $("#search-input").val().toLowerCase();
        //console.log(text);

        if(text =="" || text==undefined){
            $("#pl__container a").show();
        }else{
            $("#pl__container a").hide();
            $(".pl__title").each(function(){
                var htmlstr = $(this).html().toLowerCase();
                if(htmlstr.indexOf(text) != -1){
                    console.log(htmlstr);
                    $(this).parent().show();
                }
            })
        }


    })
})