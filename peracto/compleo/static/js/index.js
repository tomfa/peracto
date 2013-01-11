$(document).ready(function(){
    var infotext = true;
    var history = get_cookies_array(10);
    if (history.length > 0)
        $('#footer').append(' | <span id="history">history</span>');
    $('#searchfield').on('click', function (event){
        if (infotext){
            $('#searchfield').attr('value', '');
            infotext = false;
        }
    })
    $(document).on('keydown', function (event) {
        $('#searchfield').focus();
         // Enter-button
        if (event.keyCode == 13){
            text = $('#searchfield').attr('value');
            if (!infotext && text.length > 0) {
                cleanText = removeSpecialChars(text);
                if (cleanText == text)
                    go_page();
                else
                    $('#searchfield').attr('value', cleanText);
            }
            return;
        }

        // If infotext is still showing
        if (infotext){
            $('#searchfield').attr('value', '');
            infotext = false;
        }

       
    });
    $('span').on('mouseleave', function (event) {
        $('#info').fadeOut();
    });

    $('#history').on('mouseenter', function (event) {
        $('#info').stop(true, true);
        $('#info').html(history);
        $('#info').fadeIn();
    });

    $('#about').on('mouseenter', function (event) {
        $('#info').stop(true, true);
        $('#info').html('<p>Peracto is written with jQuery in a django framework by <a href="http://www.webutvikling.org">tomasalb</a>.</p><p>Peracto is a free-to-use todo-application focused on being simple to use, quick, and usable by keyboard only.</p> ');
        $('#info').fadeIn();
    });
    $('#android').on('mouseenter', function (event) {
        $('#info').stop(true, true);
        $('#info').html('<p>An android version of Peracto is currently in development.</p>');
        $('#info').fadeIn();
    });
    $('#use').on('mouseenter', function (event) {
        $('#info').stop(true, true);
        $('#info').html('<p>in the textfield above, write a name for your todo-list. if the name is currently in use, that list will show up. if not, you will be given a blank list.</p><p>a list consists of three columns, where the first and second are topic and subtopic. the last column is the actual goal column.</p></p>you navigate between the lists and items using &lt;W&gt;, &lt;A&gt;, &lt;S&gt;, &lt;D&gt; or your arrow keys.</p> <p>&lt;F2&gt; and &lt;E&gt; edits selected items, while &lt;N&gt; allows you to create new ones.</p><p>&lt;R&gt; removes the selected item.</p>');
        $('#info').fadeIn();
    });
    $('#info').on('mouseenter', function (event) {
        $('#info').stop(true, true);
        $(this).show();
    });
     $('#info').on('mouseleave', function (event) {
        $('#info').fadeOut();
    });
});

function get_cookies_array(maxsize) {
    j = 0;
    var historyhtml = "";
    if (document.cookie && document.cookie != '') {
        var split = document.cookie.split(';');
        for (var i = 0; i < split.length && j < maxsize; i++) {
            var name_value = split[split.length - i -1].split("=");
            name_value[0] = name_value[0].replace(/^ /, '');
            if (name_value[0].substring(0,4) == 'site'){
                historyhtml = historyhtml + '<a href="' + decodeURIComponent(name_value[1]) + '">' + decodeURIComponent(name_value[0].substring(4)) + '</a><br />';
                j += 1;
            }
        }
    }
    return historyhtml;
   
}

function removeSpecialChars(strVal){
    return strVal.replace(/[^a-zA-Z .\-_0-9]+/g,'');
}

function go_page() {
    page = $('#searchfield').attr('value');
    $.cookie("site" + page, "./" + page, { expires: 365 }); // 
    window.location.href = "./" + page;
    // TODO: When in prod
};

var show_allowed_keys = function() {
    $('#messagebox').stop(true, true);
    $('#messagebox').fadeIn(100);
    $('#messagebox').fadeOut(3000);
};