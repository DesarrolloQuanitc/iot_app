//Si el usuario tiene token lo enviamos a index

export default function({store,redirect}){
    store.dispatch('readToken')
    if(store.state.auth){
        return redirect('/dashboard')
    }
}