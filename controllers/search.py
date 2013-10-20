#Defaults to a search form
def index():
    #Search form
    form = FORM(DIV('Where am I'), DIV(INPUT(_name='location')),
        DIV('Program Type'), DIV(INPUT(_name='program-type')),
        DIV('Age'), DIV(INPUT(_name='age')), DIV(INPUT(_type='submit')))    
    return dict(form=form)

#Shows the search results
def result():
    #Testing the Google Maps API
    locations = db['geolocation'].select()
    return dict()
