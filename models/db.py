from gluon.tools import *
from gluon.dal import DAL, Field, geoPoint, geoLine, geoPolygon
auth = Auth(db)
auth.define_tables(migrate=False)
crud = Crud(db)

db.define_table('facility_types',
    Field('name', unique=True, requires=IS_NOT_EMPTY()),
    Field('created_on', 'datetime', default=request.now),
    Field('created_by', 'reference auth_user', default=auth.user_id),
    format='%(name)s') 

db.define_table('agencies',
    Field('childcare_provider_id', 'integer', requires=IS_NOT_EMPTY(), unique=True),
    Field('facility_type_id', 'reference facility_types'),
    Field('name', unique=True, requires=IS_NOT_EMPTY()),
    Field('street', requires=IS_NOT_EMPTY()),
    Field('county', requires=IS_NOT_EMPTY()),
    Field('email', requires=IS_NOT_EMPTY()),
    Field('min_age', 'integer', requires=IS_NOT_EMPTY()),
    Field('max_age', 'integer', requires=IS_NOT_EMPTY()),
    Field('capacity', 'integer', requires=IS_NOT_EMPTY()),
    Field('annual_inspection_date', 'datetime', requires=IS_NOT_EMPTY()),
    Field('unannounced_inspection_date', 'datetime'),
    Field('in_compliance', 'boolean'),
    Field('created_on', 'datetime', default=request.now),
    Field('created_by', 'reference auth_user', default=auth.user_id),
    format='%(name)s')

db.define_table('phone_number_types',
    Field('name', requires=IS_NOT_EMPTY()),
    Field('created_on', 'datetime', default=request.now),
    Field('created_by', 'reference auth_user', default=auth.user_id),
    format='%(name)s')     

db.define_table('phone_numbers',
    Field('agency_id', 'reference agencies'),
    Field('phone_number_type_id', 'reference phone_number_types'),
    Field('phone_number', requires=IS_NOT_EMPTY()),
    Field('created_on', 'datetime', default=request.now),
    Field('created_by', 'reference auth_user', default=auth.user_id),
    format='%(phone_number)s') 

db.define_table('program_types',
    Field('name', requires=IS_NOT_EMPTY()),
    Field('created_on', 'datetime', default=request.now),
    Field('created_by', 'reference auth_user', default=auth.user_id),
    format='%(name)s')


db.define_table('agency_program_types',
                Field('agency_id', 'reference agencies'),
                Field('program_type_id', 'reference program_types')
)

db.define_table('files',
    Field('filename', unique=True),
    Field('file', 'upload'),
    format = '%(filename)s')

db.define_table('geolocation',
    Field('agency_id', 'reference agencies'),
    Field('location', 'geometry()')    
    )


db.agencies.facility_type_id.requires = IS_IN_DB(db, db.facility_types.id, '%(name)s', multiple=True)
db.phone_numbers.phone_number_type_id.requires = IS_IN_DB(db, db.phone_number_types.id, '%(name)s')

