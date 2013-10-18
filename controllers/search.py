def index():
    form = FORM(DIV('Where am I'), DIV(INPUT(_name='location')),
        DIV('Program Type'), DIV(INPUT(_name='program-type')),
        DIV('Age'), DIV(INPUT(_name='age')), DIV(INPUT(_type='submit')))    
    return dict(form=form)
