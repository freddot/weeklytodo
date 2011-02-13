
var bloggerService;

var commonHandlers = (function() {
    
    var feedURI ='http://www.blogger.com/feeds/default/blogs';
    var activeCallback;
    var errorCallback;
    
    function handleBlogFeed(blogFeedRoot) {
        var blogEntries = blogFeedRoot.feed.getEntries();
        var blogEntry;
        var blogFound = false;
        if (blogEntries.length) {
            for (var i = 0, blogEntry; blogEntry = blogEntries[i]; i++) {
                if (blogEntry.getTitle().getText() == "weeklytodo") {
                    blogFound = true;
                    break;
                }
            }
            
        }
        
        if (!blogFound) {
            (getErrorCallback(errorCallback))("no blog named 'weeklytodo' found, create it and try again (exact spelling needed, all lower-case)");
        } else {
            var postsFeedURI = blogEntry.getEntryPostLink().getHref();
            bloggerService.getBlogPostFeed(postsFeedURI, activeCallback, getErrorCallback(errorCallback));
        }
        
    }
    
    var getErrorCallback = function(callback) {
        return function(error) {
            callback({error: error});
        };
    };
    
    return {
        getBlogPosts: function(active, error) {
            activeCallback = active;
            errorCallback = error;
            bloggerService.getBlogFeed(feedURI, handleBlogFeed, getErrorCallback(errorCallback));
        },
        getErrorCallback: getErrorCallback
    };
})();

// for now it only returns the last post
var postGetter = function(callback) {
    
    var handleBlogPostFeed = function(postsFeedRoot) {
        var post = postsFeedRoot.feed.getEntries()[0];
        callback(post);
    }
    
    commonHandlers.getBlogPosts(handleBlogPostFeed, callback);
};


var postCreator = function(title, content, callback) {

    var handleBlogPostFeed = function(postsFeedRoot) {
        var newEntry = new google.gdata.blogger.BlogPostEntry({
            title: {
              type: 'text',
              text: title
            },
            content: {
              type: 'text',
              text: content
            }
        });

        // draft
        // newEntry.setControl({draft: {value: google.gdata.Draft.VALUE_YES}});

        postsFeedRoot.feed.insertEntry(newEntry, callback, commonHandlers.getErrorCallback(callback));
    };
    
    commonHandlers.getBlogPosts(handleBlogPostFeed, callback);
    
};


var postUpdater = function(title, content, callback) {
    
    var handleBlogPostFeed = function(postsFeedRoot) {
        var postEntries = postsFeedRoot.feed.getEntries();
        var postFound = false;
        var entryURI;

        for (var i = 0, postEntry; postEntry = postEntries[i]; i++) {
            var postTitle = postEntry.getTitle().getText();
            
            if (postTitle == title) {      
                postFound = true;
                entryURI = postEntry.getSelfLink().getHref();      
                break;
            }
        }
        
        if (!postFound) {
            (commonHandlers.getErrorCallback(callback))("the todo for this week was not found at blogger atm. Possible causes: the post was removed or the service could be down.");
        } else {
            bloggerService.getBlogPostEntry(entryURI, handlePostEntry, commonHandlers.getErrorCallback(callback));
        }
    };

    var handlePostEntry = function(postEntryRoot) {
        var postEntry = postEntryRoot.entry;
        postEntry.setContent(google.gdata.Text.create(content));
        postEntry.updateEntry(callback, commonHandlers.getErrorCallback(callback));
    };

    commonHandlers.getBlogPosts(handleBlogPostFeed, callback);
};

