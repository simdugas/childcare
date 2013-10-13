import os
import csv
import json
import re

def index():
    cols = []
    form = SQLFORM(db.files)

    if form.process().accepted:
        response.flash = 'Your file was uploaded successfully. Proceeding to add data to database...'
        path = os.path.join(request.folder,'uploads', form.vars.file)

        with open(path, 'r') as fh:
            data = csv.reader(fh, delimiter=',', quotechar='"')
            for row in data:
                if not cols:
                    #set columns first time through
                    cols = row
                else:
                    
                    #check to see if the facility type exists
                    facility_type = db.facility_types(name=row[2])
                    ftid = 0

                    #insert the facility type if id doesn't exist
                    if not facility_type:
                        ftid = db.facility_types.insert(name=row[2])

                    #default age min and max to 0    
                    ages = {'min':0, 'max':0}
                    if row[8] != '':    
                        ages = minMaxAges(row[8]);

                    #default compliant to True
                    compliant = 1
                    if row[12] == 'No':
                        compliant = 0
                    
                    #check to see if an agency with this name exists
                    agency_test = db.agencies(name=row[1])
                    
                    agency_id = ''
                    #insert if it doesn't exist
                    if not agency_test:
                        agency_id = db.agencies.insert(childcare_provider_id = row[0], 
                                                       name = row[1],
                                                       facility_type_id = ftid,
                                                       street = row[3],
                                                       county = row[4],
                                                       email  = row[6],
                                                       min_age = ages['min'],
                                                       max_age = ages['max'],
                                                       capacity = row[9] if row[9].strip() >= 0 else 0,
                                                       #annual_inspection_date = row[10].strip(),
                                                       #unannounced_inspection_date = row[11].strip(),
                                                       in_compliance = compliant
                                            
                                            
                                                       )               

                        
                    #split the program types to a collection
                    program_types = row[7].split(',')
                        
                    if program_types:
                        for program_type in program_types:
                            
                            #test to see if program type exists
                            p_type = db.program_types(name=program_type)
                            program_type_id = ''
                            #if program type does not exist then create it
                            if not p_type:
                                program_type_id = db.program_types.insert(name = program_type)
                            else:
                                program_type_id = p_type.id
                            
                            #create record to join program types with agency
                            db.agency_program_types.insert(agency_id = agency_id, program_type_id = program_type_id)

    return dict(form=form)


def minMaxAges(ages_string):
    pattern = re.compile('to')
    minmax = []

    if pattern.search(ages_string):
        minmax = ages_string.split('to')
    else: 
        minmax = ages_string.split('-')
    
    return dict(min = ageFor(minmax[0]), 
                max = ageFor(minmax[1])
                )

def ageFor(age_string):
    ageType = age_string.strip().split()
    if not ageType[0]:
        return 0
    else:
        return int(ageType[0]) * 12 if ageType[1] == 'years' else ageType[0]
