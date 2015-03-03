# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 9) do

  create_table "commands", :force => true do |t|
    t.string   "undo_message"
    t.text     "original_object"
    t.datetime "created_at"
  end

  create_table "log_entries", :force => true do |t|
    t.integer  "task_id"
    t.string   "action"
    t.datetime "created_at"
  end

  create_table "task_lists", :force => true do |t|
    t.integer  "owner_id"
    t.string   "title"
    t.text     "task_order"
    t.integer  "default_rate_cents"
    t.string   "default_currency"
    t.datetime "updated_at"
  end

  create_table "tasks", :force => true do |t|
    t.integer  "task_list_id"
    t.string   "description"
    t.integer  "duration_cache"
    t.integer  "rate_cents"
    t.string   "currency"
    t.datetime "created_at",     :null => false
    t.datetime "updated_at",     :null => false
  end

  create_table "users", :force => true do |t|
    t.string   "email"
    t.string   "password"
    t.string   "default_currency"
    t.string   "display_name"
    t.text     "prefs"
    t.datetime "created_at",       :null => false
    t.datetime "updated_at",       :null => false
    t.integer  "last_command_id"
  end

  create_table "clients", :force => true do |t|
    t.integer  "id"
    t.string   "name"
    t.string   "address"
    t.string   "city"
    t.string   "state"
    t.string   "zip"
    t.string   "country"
    t.string   "email"
    t.datetime "created_at",       :null => false
    t.datetime "updated_at",       :null => false
  end

  create_table "invoices", :force => true do |t|
    t.integer  "id"
    t.string   "description"
    t.string   "client_id"
    t.string   "created"
    t.string   "due"
    t.datetime "created_at",       :null => false
    t.datetime "updated_at",       :null => false
  end

end
