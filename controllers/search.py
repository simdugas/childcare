#Defaults to a search form
def index():
    #Search form
    form = FORM(DIV('Where am I'), DIV(INPUT(_name='location')),
        DIV('Program Type'), DIV(INPUT(_name='program-type')),
        DIV('Age'), DIV(INPUT(_name='age')), DIV(INPUT(_type='submit')))    
    return dict(form=form)

#Shows the search results
def result():
    import gluon.contrib.simplejson as json
    #Testing the Google Maps API
    agencies = db(
        (db.geolocation.agency_id==db.agencies.id)
    ).select().as_list()
    
    return dict(agencies=json.dumps(agencies))
