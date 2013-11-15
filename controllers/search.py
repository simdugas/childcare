#Defaults to a search form
def index():
    form = search_form()

    if form.process().accepted: 
        response.flash = request.vars
    elif form.errors: 
        response.flash = 'form has errors' 

                    
    return dict(form=form)

def search_form():
    #create list of program types in the database
    program_types = dict()
    for pt in db().select(db.program_types.ALL,cache=(cache.ram,3600)):
        program_types[pt.id] = pt.name

    # default to program type id in list
    program_type_default = program_types.keys()[0]
    # default age? who knows
    default_age = 12

    ages = range(100)

    form = SQLFORM.factory( 
        Field('program_type_id',
              label = 'Program Type',
              default = program_type_default, 
              requires = IS_IN_SET(program_types)
              ),
        Field('age', 
              'select',
              label = 'Age(in months)',
              default = default_age, 
              requires = IS_IN_SET(ages)
              ),
        _class = 'search-form',
        submit_button = 'Search'      
        ) 
    return form;


#Shows the search results
def result():
    return dict(form=search_form())

def results(params):
    import gluon.contrib.simplejson as json
    
    # Initialize query
    agency_query = (db.geolocation.agency_id==db.agencies.id)


    if 'pos' in params:
        pos = params["pos"]
    else:
        return dict(error="Query must include a position.")
    

    if 'program_type' in params:
        agency_query = agency_query \
                & (db.agency_program_types.agency_id==db.agencies.id) \
                & (db.agency_program_types.program_type_id==int(params["program_type"]))


    if 'ages' in params:
        if len(params["ages"]) > 0:
            min_age = params["ages"][0]
            max_age = params["ages"][0]
            agency_query = agency_query \
                & (db.agencies.min_age<=min_age) \
                & (db.agencies.max_age>=max_age)
    
    min = 0
    max = 10
    if 'page' in params:
        page = int(params["page"])
        min = (page - 1 ) * 10
        max = page * 10
    else:
        page = 1


    # Use lat and lng of pos
    lat = db.geolocation.location.st_x()
    lng = db.geolocation.location.st_y()
    # Use the distance from position
    dist = db.geolocation.location.st_distance(geoPoint(pos['lat'], pos['lng']));
    
    # Query the database for results
    agencies = db(
            agency_query
        ).select(db.agencies.ALL,
            db.geolocation.ALL,
            lat,
            lng,
            orderby=dist,
            limitby=(min, max)
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

    
    
    return json.dumps(
              dict(numResults=len(agency_list),
                  page=page,
                  agencies=agency_list
              )
           )

@request.restful()
def api():
    import gluon.contrib.simplejson as json
    def GET(*args,**vars):
        return dict()
    def POST(*args,**vars):
        params = json.loads(request.body.read())
        return results(params)
    def PUT(*args,**vars):
        return dict()
    def DELETE(*args,**vars):
        return dict()
    return locals()
