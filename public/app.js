function createList(data) {
    $("#news-list").append("<div class='row' style='padding:20px; border:1px solid black'>" +
        "<div class='col-lg-12'>" +
        "<div class='row'>" +
        "<div class='col-lg-9'>" +
        "<h2>"+data.title+"</h2>" +
        "</div>" +
        "<div class='col-lg-3' style='margin-top: 25px'>" +
        "<button class='btn btn-success' style='font-size: 18px'>Save Article</button>" +
        "</div>" +
        "</div>" +
        "<div class='row'>" +
        "<div class='col-lg-12'>" +
        "<p>"+data.desc+"</p>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>")
}

function emptyList(){
    $("#news-list").append("<div class='row' style='padding:20px'>" +
        "<div class='col-lg-12' style='text-align: center'>" +
        "<h3>No news to be shown</h3>" +
        "</div>" +
        "</div>");
}

// We'll be rewriting the table's data frequently, so let's make our code more DRY
// by writing a function that takes in data (JSON) and creates a table body
function displayNews(data) {
  // Add to the table here...
    if(data.length>0)
    {
        for(let i=0;i<data.length;i++)
        {
            createList(data[i]);
        }
    }
    else
    {
        emptyList();
    }
}

$("#myModal").modal("hide");
$(".articlesNoteModal").modal("hide");
var newsId;

// $.getJSON("/all", function(data) {
//   // Call our function to generate a table body
//   $("#news-list").empty();
//   displayNews(data);
// });

$("#homeBtn").on("click", function () {
    $.getJSON("/all", function(data) {
        // Call our function to generate a table body
        $("#news-list").empty();
        displayNews(data);
    });
});

$("#scrapeBtn").on("click", function () {
    $("#myModal").modal("show");
    $.ajax({
        method: "GET",
        url: "/scrape",
    }).done(function(data) {
        console.log(data);
        setTimeout(function () {
            window.location = "/all";
        }, 1500);
    })
});

$("#savedArtBtn").on("click", function () {
    $.getJSON("/saved", function(data) {
        // Call our function to generate a table body
        $("#news-list").empty();
        displayNews(data);
    });
});

$(".addNotesBtn").on("click", function () {
    $(".modal-body").empty();
    $(".notesTextarea").val("");
    newsId = $(this).attr("data-id");
    $.ajax({
        method: "GET",
        url: "/addNotes/" + newsId,
    }).done(function(data) {
        console.log(data);
        $(".newsId").text(data.id);
        if(data.notes.length>0)
        {
            for(let i=0;i<data.notes.length;i++)
            {
                $(".modal-body").append("<div class='row' style='border:2px solid grey; border-radius: 5px; margin: 0px 5px 5px 5px; padding: 15px'>" +
                "<div class='col-lg-12'>" +
                "<div class='col-lg-10'>" +
                "<p style='margin-top: 7px'>"+data.notes[i].notes+"</p>" +
                "</div>" +
                "<div class='col-lg-2'>" +
                "<button class='btn btn-danger removeNotesBtn' data-id='"+data.notes[i]._id+"'>X</button>" +
                "</div>" +
                "</div>" +
                "</div>");
            }
        }
        else
        {
            $(".modal-body").append("<div class='row' style='border:2px solid grey; border-radius: 5px; margin-left: 5px; margin-right: 5px; padding: 15px'>" +
            "<div class='col-lg-12' style='text-align: center'>" +
            "<p style='margin-top: 7px'>No notes to be shown</p>" +
            "</div></div>")
        }
        $(".articlesNoteModal").modal("show");
    })
});

$(".saveNotesBtn").on("click", function () {
    var notesText = $(".notesTextarea").val();
    $.ajax({
        method: "POST",
        url: "/insertNotes?id=" + newsId + "&notes=" + notesText,
    }).done(function(data) {
        console.log(data);
    })
});

$(document).on("click", ".removeNotesBtn", function () {
    var notesID = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/removeNotes/" + notesID
    }).done(function(data) {
        console.log(data);
        $(".articlesNoteModal").modal("hide");
    })
});
