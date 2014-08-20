helpers do
  def current_user
    @current_user = User.find(session[:user_id]) if session[:user_id]
  end

  def callback_root
    host_and_port = request.host
    host_and_port << ":9393" if request.host == "localhost"
    return "http://#{host_and_port}"
  end

  def lastfm_auth_url
    host_and_port = request.host
    host_and_port << ":9393" if request.host == "localhost"
    "http://www.last.fm/api/auth/?api_key=#{LASTFM['api_key']}&cb=#{callback_root}/auth/lastfm"
  end

  def soundcloud_client
    SoundCloud.new({
      :client_id     => SOUNDCLOUD['client_id'],
      :client_secret => SOUNDCLOUD['client_secret'],
      :redirect_uri  => "#{callback_root}/auth/soundcloud",
    })
  end

  def soundcloud_auth_url
    client = soundcloud_client
    client.authorize_url(:scope => "non-expiring")
  end

end

get '/' do
  erb :index
end

get '/signup' do
  erb :signup
end

post '/signup' do
  user = User.create(params[:signup])
  if user.valid?
    session[:user_id] = user.id
    redirect '/'
  else
    flash[:error] = user.errors.full_messages
    redirect '/signup'
  end
end

# Get playlist
post '/playlist/generate' do
  @playlist = Playlist.create(user_id: current_user.id)
  @playlist.generate
  erb :playlist
end

get '/playlist/:playlist_id' do
  @playlist = Playlist.find(params[:playlist_id])
  @playlist.to_json
end

# Go to Last.fm Auth page
get '/login/lastfm' do
  redirect lastfm_auth_url
end

# Callback from Last.fm auth
get '/auth/lastfm' do
  token = params[:token]
  user = User.find(session[:user_id])
  user.update(:lastfm_key => user.lastfm.auth.get_session(token: token)['key'])
  redirect '/'
end

# Go to Soundcloud auth page
get '/login/soundcloud' do
  redirect soundcloud_auth_url
end

# Callback from Soundcloud auth
get '/auth/soundcloud' do
  user = User.find(session[:user_id])
  client = soundcloud_client
  p params
  access_token = client.exchange_token(:code => params['code'])
  p access_token
  user.update(:soundcloud_key => access_token.access_token)
  redirect '/'
end

get '/login' do
  erb :login
end

post '/login' do
  user = User.find_by(email: params[:email])
  if user && user.authenticate(params[:password])
    session[:user_id] = user.id
    redirect '/'
  else
    flash[:error] = "Invalid email or password"
    redirect '/login'
  end
end

# TODO: Switch to delete method via ajax
get '/logout' do
  session.clear
  redirect '/'
end