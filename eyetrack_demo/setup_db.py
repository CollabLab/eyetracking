#!/usr/bin/python
# -*- coding: utf-8 -*-
# Script to setup a local Postgres database for the Eye Tracking Debug Platform

from psycopg2 import connect
import sys
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

user = 'olivergoodman'
dbname = 'eyetracking_session_test'

try:
	# establish connection
	con = None
	con = connect(dbname='postgres', user=user, host='localhost', password='dbpass')

	# create new db
	con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
	cur = con.cursor()
	cur.execute('CREATE DATABASE ' + dbname)
	cur.close()
	con.close()
except Exception as e:
	print "Cannot connect to postgres server"
	print str(e)


try:
	# create new tables
	con = connect(dbname=dbname, user=user, host='localhost', password='dbpass')
	cur = con.cursor()
	cur.execute("CREATE TABLE session (id serial PRIMARY KEY, start_time varchar, end_time varchar);")
	cur.execute("CREATE TABLE eyetrack (id serial PRIMARY KEY, session_id integer, x integer, y integer, time integer, timestamp double precision);")
	cur.execute("CREATE TABLE moving_object (id serial PRIMARY KEY, session_id integer, x integer, y integer, timestamp double precision);")
	cur.close()
	con.commit()
	con.close()
except Exception as e:
	print 'Cannot create new tables, they already exist'
	print str(e)