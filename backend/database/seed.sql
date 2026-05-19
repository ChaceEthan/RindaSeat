INSERT INTO stations (name, district) VALUES
  ('Nyabugogo', 'Nyarugenge'),
  ('Huye', 'Huye'),
  ('Ruhango', 'Ruhango'),
  ('Nyamata', 'Bugesera'),
  ('Kabuga', 'Gasabo'),
  ('Nyanza', 'Nyanza')
ON CONFLICT (name) DO NOTHING;

INSERT INTO companies (name, logo_url) VALUES
  ('RITCO', null),
  ('Horizon', null),
  ('Volcano Express', null),
  ('Alpha Express', null)
ON CONFLICT (name) DO NOTHING;
