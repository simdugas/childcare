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
    lat = db.geolocation.location.st_x()
    lng = db.geolocation.location.st_y()
    agencies = db(
        (db.geolocation.agency_id==db.agencies.id)
    ).select(db.agencies.ALL,
            db.geolocation.ALL,
            lat,
            lng
            )
    
    # Create agency list for view
    agency_list = []
    for agency in agencies:
        add = dict()
        add['id'] = agency.agencies.id
        add['childcare_provider_id'] = agency.agencies.childcare_provider_id
        add['name'] = agency.agencies.name
        add['street'] = agency.agencies.street
        add['county'] = agency.agencies.county
        add['email'] = agency.agencies.email
        add['min_age'] = agency.agencies.min_age
        add['max_age'] = agency.agencies.max_age
        add['capacity'] = agency.agencies.capacity
        #add['annual_inspection_date'] = agency.agencies.annual_inspection_date.isoformat()
        add['in_compliance'] = agency.agencies.in_compliance
        add['lat'] = agency[lat]
        add['lng'] = agency[lng]
        agency_list.append(add)
    
    return dict(agencies=json.dumps(agency_list))
