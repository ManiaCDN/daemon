
$(function() {
    $('body').scrollspy({
        target: '.sidebar',
        offset: 40
    });


    $('.server-status').each(function() {
        var code = $(this).data('status');

        var classes = "";
        var text = "";
        var icon = "";

        switch(code) {
            case 0:
                classes = "bg-warning";
                text = "Server update status Unknown!";
                icon = "glyphicon-flash";
                break;

            case 1:
                classes = "bg-success";
                icon = "glyphicon-ok";
                text = "Server updated! (< 6 hours!)";
                break;
            case 2:
                classes = "bg-success";
                icon = "glyphicon-ok";
                text = "Server updated! (< 12 hours)";
                break;

            case 3:
                classes = "bg-warning";
                text = "Server is outdated! (< 24 hours)";
                icon = "glyphicon-refresh";
                break;

            case 4:
                classes = "bg-danger";
                text = "Server isn't operating anymore and disabled! (> 24 hours no update)";
                icon = "glyphicon-remove";
        }

        $(this).addClass(classes);
        $(this).html("<i class='glyphicon "+icon+"'></i> " + text);
    });
});

