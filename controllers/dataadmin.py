import os
import csv
import json
import re
import math
import datetime

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
                    ftid = insertFacilityType(row[2])
                    ages = minMaxAges(row[8].strip());
                    
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
                                                       in_compliance = 0 if row[12] == 'No' else 1,
                                                       annual_inspection_date = parseDate(row[10]),
                                                       unannounced_inspection_date = parseDate(row[11])
                                                       )               


                    if agency_id:
                        insertAgencyLocation(row[14], row[15], agency_id)
                        insertProgramTypes(row[7], agency_id)
                    else:
                        agency_id = agency_test.id

                    insertPhoneNumber(row[5], agency_id)
                    
    return locals()


def minMaxAges(ages_string):
    naPattern = re.compile('N/A')
    pattern = re.compile('to')
    minmax = []

    min = 0
    max = 0

    if not naPattern.search(ages_string):
        if pattern.search(ages_string):
            minmax = ages_string.split('to')
        else: 
            minmax = ages_string.split('-')
        min = ageFor(minmax[0])
        max = ageFor(minmax[1])

    return locals()

def ageFor(age_string):
    
    ageType = age_string.strip().split()
    age = 0
    
    if not ageType[0]:
        return 0
    else:
        try:
            age = int(ageType[0])
        except ValueError:
            age = math.floor(float(ageType[0]))
        else:
            age = 0
            
    return (age * 12 if ageType[1] == 'years' else age)


def insertFacilityType(facility_type_name):
    #check to see if the facility type exists
    facility_type = db(db.facility_types.name==facility_type_name).select().first()
    ftid = ''
    #insert the facility type if id doesn't exist
    if not facility_type:
        ftid = db.facility_types.insert(name=facility_type_name)
    else:
        ftid = facility_type.id
        
    return ftid;

def insertAgencyLocation(lat, lng, agency_id):
    geolocation_id = ''
    if lat and lng:
        geolocation_id = db.geolocation.insert(agency_id=int(agency_id), location="POINT (" + lat + " " + lng + "2)")
    return geolocation_id

def insertProgramTypes(program_types_string, agency_id):
#split the program types to a collection
    program_types = program_types_string.split(',')
    program_type_id = ''    
    if program_types:
        for program_type in program_types:
            #test to see if program type exists
            exists = db.program_types(name=program_type)
            
            #if program type does not exist then create it
            if not exists:
                program_type_id = db.program_types.insert(name = program_type)
            else:
                program_type_id = exists.id
                
    db.agency_program_types.insert(agency_id = agency_id, program_type_id = program_type_id)

def parseDate(date_string):
    return ('' if date_string == 'N/A' else date_string)

def insertPhoneNumber(phone_number_string, agency_id):
  #match only digits
    stripped = re.sub(r'\D', '', phone_number_string)
  #format only first 10 digits matched
  #assumes a lot but keeps out a lot of garbage as well
    formatted_phone_number = '0000000000'
    if stripped.__len__() >= 10:
        formatted_phone_number = phone_format(stripped[0:10])

    db.phone_numbers.insert(agency_id = agency_id, phone_number = formatted_phone_number)

def phone_format(n):
    return format(int(n[:-1]), ",").replace(",", "-") + n[-1]  
