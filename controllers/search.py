#Defaults to a search form
def index():

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
        Field('userlocation'),
        _class = 'search-form',
        submit_button = 'Search'
      
        ) 

    if form.process().accepted: 
        response.flash = request.vars
    elif form.errors: 
        response.flash = 'form has errors' 

                    
    return dict(form=form)

#Shows the search results
def result():
    import gluon.contrib.simplejson as json
    #Testing the Google Maps API
    agencies = db(
        (db.geolocation.agency_id==db.agencies.id)
    ).select()
    
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
        add['geolocation'] = agency.geolocation.location
        agency_list.append(add)
    
    return dict(agencies=json.dumps(agency_list))
