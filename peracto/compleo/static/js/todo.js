/* KNOWN BUGS 

- new elements are given elementcollection.length identifier
    This is a problem if e.g. a theme is created, another one deleted
    and yet a new one created. Both new elements are given the same identifier

- new elements are not treated equally
    If you go right from a topic whose all themes have been created,
    none of them are automatically selected. The underlying problem might
    cause new bugs to be discovered.

*/

/* Base variables */
    var currentTopicNum = -1;
    var currentThemeNum = -1;
    var currentGoalNum = -1;

    // false/true for which column is chosen
    var topicChosen = false;
    var themeChosen = false;
    var goalChosen = false;

    var writeMode = false;
    var editMode = false;

    // clickable elements
    var parectolistpk;
    var topics = [];
    var themes;
    var goals;

    var getCurrentGoal = function() {return goals[currentGoalNum];}
    var getCurrentTheme = function() {return themes[currentThemeNum];}
    var getCurrentTopic = function() {return topics[currentTopicNum];}

    // dynamic colors
    var goalcolumn_color = '#FBFBFB';
    var overhead_theme_color = '#FFFFFF';
    var overhead_topic_color = '#090909';
    var overhead_goal_color = '#121212';
    var activetheme_color = '#282828'
    var activetopic_color = '#DEDEDE'
    var activegoal_color = '#000';
    var activecheckedgoal_color = '#000';

    // gets elements with the given classname
    var getTopic = function(className){
        for (var i = topics.length - 1; i >= 0; i--) {
            if ($(topics[i]).attr('class') == className)
                return topics[i];
        };};
    var getTheme = function(className){
        for (var i = themes.length - 1; i >= 0; i--) {
            if ($(themes[i]).attr('class') == className)
                return themes[i];
        };};
    var getGoal = function(className){
        for (var i = goals.length - 1; i >= 0; i--) {
            if ($(goals[i]).attr('class') == className)
                return goals[i];
        };};

// Topic-object and its variables and functions
var myTopic = new Object();
    myTopic.placement = function() {
        return $(topics).index(this);
    };  // plassering i allTopics/topics
    myTopic.themes = [];
    myTopic.topicName;
    myTopic.string;
    myTopic.pk;
    myTopic.init = function() {
        this.topicName = $(this).attr('class').match(/topic.+?\b/);
        this.pk = String(this.topicName).substring(5);
        this.themes = $("#theme").children('.' + this.topicName).children('.theme');
        for (var i = this.themes.length - 1; i >= 0; i--) {
            $.extend(this.themes[i], myTheme);
            this.themes[i].init(this);
        };
    };

    myTopic.setPk = function(pk) {
        this.pk = pk;
        this.topicName = "topic" + this.pk;
        $(this).attr('class',  this.topicName + ' topic');
    }

    myTopic.activate = function() { // topic markert (i fokus)
        fokus('topic');

        // deactivate a potential current topic 
        if (currentTopicNum == this.placement())
            return;
        else if (currentTopicNum != -1) {
            getCurrentTopic().deactivate();
        }   

        // set globals correctly
        currentTopicNum = this.placement();
        themes = this.themes;

        // activate topic (visually) 
        $(this).children('h3').css('color', activetopic_color);
        $(this).css('opacity', '1.0'); 
        $(this).children('.info').show();

        // activate theme-column (visually)
        $("#theme").css('background-color', $(this).css('background-color'));
        $("#theme").children("h2").text(this.getName());

        // shows theme-children and put them in current
        for (var i = this.themes.length - 1; i >= 0; i--) {
            $(this.themes[i]).show();
        };
    };
    myTopic.deactivate = function() { // topic ikke markert (ikke i fokus)
        // set globals correctly
        currentTopicNum = -1;
        themes = null;

        // deactivate topic (visually)
        $(this).removeAttr('style');
        $(this).children('h3').removeAttr('style');
        $(this).children('.info').hide();

        // activate theme-column (visually)
        $("#theme").css('background-color', '');
        $("#theme").children("h2").text('');

        // hides theme-children
        for (var i = this.themes.length - 1; i >= 0; i--) {
            $(this.themes[i]).hide();
        };
    };
    myTopic.scratch = function() {
        $.post("./delete/", 
            { operations: "topic|" + this.pk + "|"+ this.getName() }
        );
        topics.splice(currentTopicNum, 1);
        this.deactivate();
        $(this).hide();
        $(this).remove();
    };
    myTopic.rename = function(newName) {
        $.post("./rename/", 
            { operations: "topic|" + this.pk + "|"+ this.getName() +"|" + newName }
            // function(data) { var pk = $( data ).find( '#pk' ); alert("PrimaryKey: " + pk); 
        );
        $(this).children('h3').text(newName);
        $(this).show();
        $("#theme").children("h2").text(newName);
        
    };
    myTopic.getName = function() {
        return $(this).children('h3').text().trim();
    };
    myTopic.next = function() {
        return topics[(this.placement() + 1)%topics.length];
    };
    myTopic.previous = function() {
        return topics[(this.placement() + topics.length -1)%topics.length];
    };

// Theme-object and its variables and functions
var myTheme = new Object();
    myTheme.placement = function() {
        return $(this.parentTopic.themes).index(this);
    }; 
    myTheme.parentTopic;
    myTheme.themeName;
    myTheme.string;
    myTheme.pk;
    myTheme.goals = [];
    myTheme.setPk = function(pk) {
        this.pk = pk;
        this.themeName = "theme" + this.pk;
        $(this).attr('class',  this.themeName + ' theme');
    }
    myTheme.init = function(topic) {
        this.parentTopic = topic;
        this.themeName = $(this).attr('class').match(/theme.+?\b/); // navnet på klikket theme
        this.pk = String(this.themeName).substring(5);
        this.goals = $("#goal").children('.'+ this.parentTopic.topicName).children('.' + this.themeName).children('.goal');
        for (var i = this.goals.length - 1; i >= 0; i--) {
            $.extend(true, this.goals[i], myGoal);
            this.goals[i].goalName = $(this.goals[i]).attr('class').match(/goal.+?\b/); 
            this.goals[i].pk = String(this.goals[i].goalName).substring(4);
            if ($(this.goals[i]).attr('class').match(/checked/g)) {
                $(this.goals[i]).children(':checkbox').checked = true;
                this.goals[i].done = true;
                $(this).children('p').css('text-decoration', 'line-through'); 
                $(this).css('color', activegoal_color); 
            }
            this.goals[i].parentTheme = this;
        };
    };
    myTheme.activate = function() { // topic markert (i fokus)
        fokus('theme');
        if (currentThemeNum == this.placement())
            return;
        else if (currentThemeNum != -1)
            getCurrentTheme().deactivate();

        // set globals correctly
        currentThemeNum = this.placement();
        goals = this.goals;
        
        // activate theme visually
        $(this).children('h3').css('color', activetheme_color);
        $(this).css('background-color', goalcolumn_color);
        
        // activate goal-column (visually)
        $("#goal").css('background-color', goalcolumn_color)
        $("#goal").children("h2").text(this.getName());
        $("#goal").show();
        
        // vis goals
        for (var i = this.goals.length - 1; i >= 0; i--) {
            $(this.goals[i]).show();
        };
    };
    myTheme.deactivate = function() { // topic ikke markert (ikke i fokus)
        // set globals correctly
        currentThemeNum = -1;
        goals = null;

        // deactivate theme visually
        $(this).css('background-color', '');
        $(this).css('color', ''); 
        $(this).children('h3').removeAttr('style');
        
        // activate goal-column (visually)
        $("#goal").children("h2").text('');
        $("#goal").hide();

        // hide goals
        for (var i = this.goals.length - 1; i >= 0; i--) {
            $(this.goals[i]).hide();
        };
    };
    myTheme.scratch = function() {
        $.post("./delete/", 
            { operations: "theme|" + this.pk + "|"+ this.getName() }
        );
        themes.splice(currentThemeNum, 1);
        this.deactivate();
        $(this).hide();
        $(this).remove();
        // TODO: AJAX 
    }
    myTheme.rename = function(newName) {
        $.post("./rename/", 
            { operations: "theme|" + this.pk + "|"+ this.getName() +"|" + newName }
            // function(data) { var pk = $( data ).find( '#pk' ); alert("PrimaryKey: " + pk); 
        );
        $(this).children('h3').text(newName);
        $("#goal").children("h2").text(newName);
    };
    myTheme.getName = function() {
        return $(this).children('h3').text().trim();
    };
    myTheme.next = function() {
        return themes[(this.placement() + 1)%themes.length];
    }
    myTheme.previous = function() {
        return themes[(this.placement() + themes.length -1)%themes.length];
    }

// Goal-object and its variables and functions
var myGoal = new Object();
    myGoal.placement = function() {
        return $(this.parentTheme.goals).index(this);
    }; 
    myGoal.parentTheme;
    myGoal.done = false;
    myGoal.string;
    myGoal.goalName;
    myGoal.pk;
    myGoal.setPk = function(pk) {
        this.pk = pk;
        this.string = "goal" + this.pk;
        $(this).attr('class',  this.string + ' goal');
    }
    myGoal.activate = function() {
        fokus('goal');
        if (currentGoalNum == this.placement())
            return;
        else if (currentGoalNum != -1)
            getCurrentGoal().deactivate();

        // set globals correctly
        currentGoalNum = this.placement();

        // activate theme visually
        $(this).children('p').css('opacity', '1.0');
        $(this).css('opacity', '1.0');
        if (this.done){
            $(this).css('color', activecheckedgoal_color);
        }
        else {
            $(this).css('color', activegoal_color);
        }
    };
    myGoal.deactivate = function() {
        currentGoalNum = -1;
        if (this.done) {
            $(this).children('p').css('opacity', '');
            $(this).css('opacity', '');
            $(this).css('color', '');
        }
        $(this).css('color', ''); 
        $(this).css('opacity', '');
    };
    myGoal.scratch = function() {
        $.post("./delete/", 
            { operations: "goal|" + this.pk + "|"+ this.getName() }
        );
        goals.splice(currentGoalNum, 1);
        this.deactivate();
        $(this).hide();
        $(this).remove();
        // TODO: AJAX 
    }
    myGoal.rename = function(newName) {
        newName = newName.trim();
        $.post("./rename/", 
            { operations: "theme|" + this.pk + "|"+ this.getName() +"|" + newName }
            // function(data) { var pk = $( data ).find( '#pk' ); alert("PrimaryKey: " + pk); 
        );
        $(this).children('p').text(newName);
    };
    myGoal.getName = function() {
        return $(this).children('p').text().trim();
    };
    myGoal.next = function() {
        return goals[(this.placement() + 1)%goals.length];
    }
    myGoal.previous = function() {
        return goals[(this.placement() + goals.length -1)%goals.length];
    }
    myGoal.uncheck = function() {
        this.activate();
        this.done = false;
        $(this).children('p').css('text-decoration', 'none'); 
        $(this).css('color', activegoal_color);
        $.post("./check/", 
            { operations: "0|" + this.pk + "|"+ this.getName() }
            // function(data) { var pk = $( data ).find( '#pk' ); alert("PrimaryKey: " + pk); 
        );
    }
    myGoal.check = function() {
        this.activate();
        this.done = true;
        $(this).children('p').css('text-decoration', 'line-through'); 
        $(this).css('color', activegoal_color); 
        $.post("./check/", 
            { operations: "1|" + this.pk + "|"+ this.getName() }
            // function(data) { var pk = $( data ).find( '#pk' ); alert("PrimaryKey: " + pk); 
        );
    }

// Sets focus on either of the columns
fokus = function (type) {
    if (type == 'topic'){
        topicChosen = true;
        themeChosen = false;
        goalChosen = false;

        // Deactivates any active goal
        if (currentGoalNum != -1)
            getCurrentGoal().deactivate();

        // Deactivates any active theme
        if (currentThemeNum != -1)
            getCurrentTheme().deactivate();

        // Changes the color of columnheading 
        $('#logo').children('h1').css('color', overhead_topic_color);
        $('#theme').children('h2').removeAttr('style');
        $('#goal').children('h2').removeAttr('style');
        
    }
    else if (type == 'theme'){
        topicChosen = false;
        themeChosen = true;
        goalChosen = false;

        // Deactivates any active goal
        if (currentGoalNum != -1)
            getCurrentGoal().deactivate();  

        // Changes the color of columnheading 
        $('#logo').children('h1').removeAttr('style');
        $('#theme').children('h2').css('color', overhead_theme_color);
        $('#goal').children('h2').removeAttr('style');
    }
    else if (type == 'goal'){
        topicChosen = false;
        themeChosen = false;
        goalChosen = true;
        
        // Changes the color of columnheading 
        $('#logo').children('h1').removeAttr('style');
        $('#theme').children('h2').removeAttr('style');
        $('#goal').children('h2').css('color', overhead_goal_color);
    }
};

$(document).ready(function(){
    // Sets focus to topic column
    fokus('topic');
    parectolistpk = $('#main').attr('class');
    // Sets all divs that has class "topic" as topics
    $(".topic").each(function() { 
        topics.push(this);
        $.extend(topics[(topics.length-1)], myTopic);
        topics[(topics.length-1)].init();
        (topics.length);
    });
    
    if (topics.length > 0)
        topics[0].activate();
});

// Focuses any column that is clicked
$(document).on("click", "#topic", function(){ 
    if (writeMode)
        close_writeMode();
    fokus('topic');
});
$(document).on("click", "#theme", function(){ 
    if (writeMode)
        close_writeMode();
    if (currentTopicNum != -1)
        fokus('theme');
});
$(document).on("click", "#goal", function(){ 
    if (writeMode)
        close_writeMode();
    if (currentThemeNum != -1)
        fokus('goal');
});

$(document).on("click", "#goal_textfield", function(e){ 
   e.stopPropagation();
});

$(document).on("click", "#topic_textfield", function(e){ 
   e.stopPropagation();
});

$(document).on("click", "#theme_textfield", function(e){ 
   e.stopPropagation();
});

// If you click a spesific topic 
$(document).on("click", ".topic", function(){ 
    if (writeMode)
        close_writeMode();
    getTopic($(this).attr('class')).activate();
});

// If you click a spesific theme 
$(document).on("click", ".theme", function(){ 
    if (writeMode)
        close_writeMode();
    getTheme($(this).attr('class')).activate(); 
});

$(document).on("click", ".goal", function() {
    getGoal($(this).attr('class')).activate();
})

// If you click a goal checkbox 
$(document).on("change", ":checkbox", function() {
    if (writeMode)
        close_writeMode();
    if($(this).attr("checked"))
        getGoal($(this).parent().attr('class')).check();
    else
        getGoal($(this).parent().attr('class')).uncheck();
});

// Key handler
$(document).keydown(function(e) { if (!e.altKey && !e.metaKey && !e.shiftKey) handle_key(e); }); 

handle_key = function(e) {
    var tast = e.keyCode || e.which; 
    // If in writeMode, disable functions for anything but tab, enter and escape
    if (writeMode && (tast != 13) && (tast != 27) && (tast != 9)) 
        return;
    switch(tast) {
        case 9: // tab
        case 27: // esc
            if (writeMode)
                close_writeMode();
        break;
        case 37: // left
            e.preventDefault(); 
        case 65: // a
        case 97: // A
            go_left();
        break;

        case 38: // up
            e.preventDefault(); 
        case 119: // w
        case 87: // W
            go_up();
        break;

        case 39: // right
            e.preventDefault(); 
        case 68: // D
        case 100: // d
            go_right();
        break;

        case 40: // down
            e.preventDefault(); 
        case 115: // s
        case 83: // S
            go_down();
        break;   

        case 78: //n
            e.preventDefault(); 
            new_instance();
        break;

        case 82: // r
            remove_instance();
        break;

        case 69: //e
        case 113: //F2
            e.preventDefault(); 
            edit_instance();
        break;

        case 32: // space 
            if (writeMode)
                return;
        case 13: // enter
            if (writeMode)
                submit_edit();
            else if (goalChosen){ 
                e.preventDefault();
                $(getCurrentGoal()).children(':checkbox').trigger('click'); // Lat som bruker klikker
            }
        break;   

        default: return; // exit this handler for other keys
    }
}

 // Activates the previous element in the active column
go_up = function() { 
    if (topicChosen && topics.length > 0) {
        if (currentTopicNum == -1)
            currentTopicNum = 0;
        getCurrentTopic().previous().activate();
    }
    else if (themeChosen && themes.length > 0) {
        if (currentThemeNum == -1)
            currentThemeNum = 0;
        getCurrentTheme().previous().activate();
    }
    else if (goalChosen && goals.length > 0) {
        if (currentGoalNum == -1)
            currentGoalNum = 0;
        getCurrentGoal().previous().activate();
    }
}

// Goes to the righthand column
go_right = function() {
    if (topicChosen) {
        if (currentTopicNum == -1) go_down();
        else {
            fokus('theme');
            go_down();
        }
    }
    else if (themeChosen) {
        if (currentThemeNum == -1) go_down();
        else if (themes.length > 0) {
            fokus('goal');
            go_down();
        }
    }
}

// Activates the next element in the active column
go_down = function() {
    if (topicChosen && topics.length > 0) {
        if (currentTopicNum == -1)
            topics[0].activate();
        else
            getCurrentTopic().next().activate();
    }
    else if (themeChosen && themes.length > 0) {

        if (currentThemeNum == -1)
            themes[0].activate();
        else
            getCurrentTheme().next().activate();
    }
    else if (goalChosen && goals.length > 0) {
        if (currentGoalNum == -1)
            goals[0].activate();
        else
            getCurrentGoal().next().activate();
    }
}

// Goes to the lefthand column
go_left = function() {
    if (themeChosen) {
        fokus('topic');
    }
    else if (goalChosen) {
        fokus('theme');
    }
}

// Closes the writemode and show any potenially hidden element
close_writeMode = function () {
    if (topicChosen) {
        if (editMode)
            $(getCurrentTopic()).show();
        $('#topic_textfield').attr("value", "");
        $('#topic_textfield').hide();
    }
    else if (themeChosen) {
        if (editMode)
            $(getCurrentTheme()).show();
        $('#theme_textfield').attr("value", "");
        $('#theme_textfield').hide();
    }
    else if (goalChosen) {
        if (editMode)
            $(getCurrentGoal()).show();
        $('#goal_textfield').attr("value", "");
        $('#goal_textfield').hide();
    }
    writeMode = false;
    editMode = false;
}

// Changes the selected elements name to the given text
changeElement = function(text){
    if (topicChosen){
        getCurrentTopic().rename(text);
        $(getCurrentTopic()).show();
    }
    else if (themeChosen){
        getCurrentTheme().rename(text);
        $(getCurrentTheme()).show();
    }
    else if (goalChosen){
        getCurrentGoal().rename(text);
        $(getCurrentGoal()).show();
    }
}

// Adds a new element with the given text in the active column
addElement = function(text){
    var newObject = document.createElement('div');
    if (topicChosen){
        $(newObject).attr('class', 'topic' + (topics.length+1) + ' topic');
        $.extend(true, newObject, myTopic);
        $(newObject).html('<h3>' + text + '</h3><div class="info"></div>');
        newObject.topicName = "theme" + (topic.length+1);
        newObject.pk = topic.length+1;
        topics.push(newObject);
        $('#description').before(newObject);
        $.post("./add/", 
            { operations: "topic|" + parectolistpk + "|0|" + text + ""},
            function(data) { var pk = $( data ).find( '#pk' ).text(); newObject.setPk(pk); }
        );
    }
    else {
        var topicName = getCurrentTopic().topicName;
        if (themeChosen){
            $(newObject).attr('class', 'theme' + (themes.length+1) + ' theme');
            $.extend(true, newObject, myTheme);
            $(newObject).html('<h3>' + text + '</h3>');
            if (!($('#theme').children('.' + topicName).length)) {
                $('#theme').append('<div class="' + topicName + '"></div>');
            }
            newObject.themeName = "theme" + (themes.length+1);
            newObject.pk = (theme.length +1);
            themes.push(newObject);
            newObject.parentTopic = getCurrentTopic();
            $('#theme').children('.' + topicName).append(newObject);
            $(newObject).show();
            $.post("./add/", 
                { operations: "theme|" + String(topicName).substring(5) + "|"+ newObject.parentTopic.getName() +"|" + text },
                function(data) { var pk = $( data ).find( '#pk' ).text(); newObject.setPk(pk); }
                );
        }
        else if (goalChosen){
            var themeName = getCurrentTheme().themeName;
            $(newObject).attr('class', 'goal' + (goals.length+1) + ' goal');
            $.extend(true, newObject, myGoal);
            $(newObject).html('<input type="checkbox" id="goal' + (goals.length +1) + '"/><label for="goal' + (goals.length + 1) + '"></label><p>' + text + '</p>');
            if (!($('#goal').children('.' + topicName).length))
                $('#goal').append('<div class="' + topicName + '"></div>');
            if (!($('#goal').children('.' + topicName).children('.' + themeName).length))
                $('#goal').children('.' + topicName).append('<div class="' + themeName + '"></div>');
            goals.push(newObject);
            newObject.parentTheme = getCurrentTheme();
            $('#goal').children('.' + topicName).children('.' + themeName).append(newObject);
            $(newObject).show();

            $.post("./add/", 
                { operations: "goal|" + String(themeName).substring(5) + "|"+ newObject.parentTheme.getName() +"|" + text },
                function(data) { var pk = $( data ).find( '#pk' ).text(); newObject.setPk(pk); }
                );
        }   
    }
}

// displays and focuses input field for the correct column
new_instance = function() {
    writeMode = true;
    if (topicChosen) {
        $('#topic_textfield').show();
        $('#topic_textfield').focus();
    }
    else if (themeChosen) {
        $('#theme_textfield').show();
        $('#theme_textfield').focus();
    }
    else if (goalChosen) {
        $('#goal_textfield').show();
        $('#goal_textfield').focus();
    }
}

// removes the selected element
remove_instance = function() {
    // TODO: R U SURE?
    if (topicChosen) {
        getCurrentTopic().scratch();
    }
    else if (themeChosen) {
        getCurrentTheme().scratch();
    }
    else if (goalChosen) {
        getCurrentGoal().scratch();
    }
}

// Selects the chosen element and puts it in the input field for edit
edit_instance = function() {
    if (topicChosen && currentTopicNum != -1) {
        writeMode = true;
        editMode = true;
        $('#topic_textfield').show();
        $('#topic_textfield').attr('value', getCurrentTopic().getName());
        $('#topic_textfield').focus();
        $(getCurrentTopic()).hide();
    }
    else if (themeChosen && currentThemeNum != -1) {
        writeMode = true;
        editMode = true;
        $('#theme_textfield').show();
        $('#theme_textfield').attr('value', getCurrentTheme().getName());
        $('#theme_textfield').focus();
        $(getCurrentTheme()).hide();
    }
    else if (goalChosen && currentGoalNum != -1) {
        writeMode = true;
        editMode = true;
        $('#goal_textfield').show();
        $('#goal_textfield').attr('value', getCurrentGoal().getName());
        $('#goal_textfield').focus();
        $(getCurrentGoal()).hide();
    }
}

// submits the current textfields text for change or adding
submit_edit = function(){
    var text;
    if (topicChosen) 
        text = $('#topic_textfield').attr("value");
    else if (themeChosen) 
        text = $('#theme_textfield').attr("value");
    else if (goalChosen) 
        text = $('#goal_textfield').attr("value");
    if (text == ''){
        close_writeMode();
        return;
    }
    else if (editMode) 
        changeElement(text);
    else
        addElement(text);
    close_writeMode();
}